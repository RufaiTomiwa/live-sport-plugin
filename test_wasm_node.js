// Download gasm.wasm and analyze what the set_stream / set_stream_jw functions do
// Use wasmtime or a Node WASM runner to inspect the cipher

const https = require('https');
const fs = require('fs');

function fetchRaw(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function encodeChannelProto(channel) {
  const buf = Buffer.from(channel, 'utf8');
  return Buffer.concat([Buffer.from([0x0a, buf.length]), buf]);
}

// Try to run the WASM in Node.js by providing minimal mock imports
// and see if we can get it to decrypt without a full browser
async function tryRunWasm(wasmBuffer, encryptedBytes) {
  console.log('\n=== Attempting to run WASM in Node.js with mock imports ===\n');

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  
  let memory;
  let result = null;

  // Minimal mock — just enough to not crash
  const mockImports = {
    './wasmgasm_bg.js': new Proxy({}, {
      get(_, name) {
        return (...args) => {
          // Return null/0 for most things
          if (name.includes('instanceof')) return false;
          if (name.includes('new_')) return {};
          return undefined;
        };
      }
    })
  };

  try {
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, mockImports);
    memory = wasmModule.instance.exports.memory;
    const exports = wasmModule.instance.exports;
    console.log('WASM exports:', Object.keys(exports));

    // Try init_wasm
    if (exports.init_wasm) {
      try {
        exports.init_wasm();
        console.log('init_wasm() called successfully');
      } catch(e) {
        console.log('init_wasm() failed:', e.message);
      }
    }

    // Try set_stream with the encrypted data written to memory
    if (exports.set_stream || exports.set_stream_jw) {
      // Write the encrypted bytes to WASM memory at some offset
      const mem8 = new Uint8Array(memory.buffer);
      const inputOffset = 1024; // arbitrary offset above wasm stack
      mem8.set(encryptedBytes, inputOffset);
      
      const fn = exports.set_stream_jw || exports.set_stream;
      console.log(`Calling ${exports.set_stream_jw ? 'set_stream_jw' : 'set_stream'} with ptr=${inputOffset}, len=${encryptedBytes.length}`);
      
      try {
        const ret = fn(inputOffset, encryptedBytes.length);
        console.log('Return value:', ret);
        
        // Scan memory for https:// after call
        const str = decoder.decode(new Uint8Array(memory.buffer));
        const idx = str.indexOf('https://');
        if (idx !== -1) {
          const end = str.indexOf('\0', idx);
          console.log('Found URL in memory:', str.slice(idx, end > -1 ? end : idx + 200));
          result = str.slice(idx, end > -1 ? end : idx + 200);
        } else {
          console.log('No https:// found in memory after set_stream call');
        }
      } catch(e) {
        console.log('set_stream call failed:', e.message);
      }
    }
  } catch(e) {
    console.log('WASM instantiation failed:', e.message);
  }

  return result;
}

async function main() {
  const channel = process.argv[2] || 'rally-tv';

  // Download gasm.wasm
  const wasmPath = `gasm_${channel}.wasm`;
  let wasmBuffer;
  
  if (fs.existsSync(wasmPath)) {
    console.log(`[1] Loading cached WASM: ${wasmPath}`);
    wasmBuffer = fs.readFileSync(wasmPath);
  } else {
    console.log('[1] Downloading gasm.wasm...');
    const wasmRes = await fetchRaw('https://assets.embedindia.st/js/wasm/gasm.wasm', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://embedindia.st/',
        'Origin': 'https://embedindia.st',
        'Accept': 'application/wasm,*/*'
      }
    });
    wasmBuffer = wasmRes.body;
    fs.writeFileSync(wasmPath, wasmBuffer);
    console.log(`    Downloaded ${wasmBuffer.length} bytes, saved to ${wasmPath}`);
  }

  // Fetch encrypted data
  const protoBody = encodeChannelProto(channel);
  console.log('\n[2] Fetching encrypted stream data...');
  const fetchRes = await fetchRaw('https://embedindia.st/fetch', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/octet-stream',
      'Content-Length': protoBody.length,
      'Referer': `https://embedindia.st/embed-noads/${channel}`,
      'Origin': 'https://embedindia.st'
    }
  }, protoBody);

  // Parse protobuf field 1 = encrypted blob
  let pos = 0, encrypted = null;
  while (pos < fetchRes.body.length) {
    const tag = fetchRes.body[pos++];
    const fieldNum = tag >> 3;
    const wireType = tag & 0x7;
    if (wireType === 2) {
      let len = 0, shift = 0;
      while (true) {
        const b = fetchRes.body[pos++];
        len |= (b & 0x7f) << shift;
        if (!(b & 0x80)) break;
        shift += 7;
      }
      if (fieldNum === 1) encrypted = fetchRes.body.slice(pos, pos + len);
      pos += len;
    } else break;
  }

  if (!encrypted) { console.error('No field 1 in response'); return; }
  console.log(`    Got ${encrypted.length} bytes of encrypted data`);
  console.log(`    Hex: ${encrypted.toString('hex').slice(0, 80)}...`);

  // Try WASM in Node.js
  const decrypted = await tryRunWasm(wasmBuffer, encrypted);
  if (decrypted) {
    console.log('\n✅ SUCCESS! Decrypted URL:', decrypted);
  } else {
    console.log('\n❌ Node.js WASM approach failed — DOM imports block it');
    console.log('\nNext approach: analyze the gasm.wasm binary with wasm2wat to find the cipher');
    console.log(`Run: wasm2wat ${wasmPath} -o gasm.wat`);
  }
}

main().catch(console.error);
