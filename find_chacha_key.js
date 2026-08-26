// Find the ChaCha20 key and nonce from the gasm.wasm binary
// Strategy: We know ciphertext and plaintext for one message.
// The WASM uses ChaCha20. Key is 32 bytes, nonce is 12 bytes.
// Both must be hardcoded in the WASM binary.
// We'll try every 32-byte window in the WASM as the key,
// and every 12-byte window as the nonce, until one decrypts correctly.

const { chacha20 } = require('./node_modules/@noble/ciphers/chacha.js');
const fs = require('fs');
const https = require('https');

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
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
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

async function getEncryptedBlob(channel) {
  const protoBody = encodeChannelProto(channel);
  const res = await fetchRaw('https://embedindia.st/fetch', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/octet-stream',
      'Content-Length': protoBody.length,
      'Referer': `https://embedindia.st/embed-noads/${channel}`,
      'Origin': 'https://embedindia.st'
    }
  }, protoBody);

  let pos = 0, encrypted = null;
  while (pos < res.body.length) {
    const tag = res.body[pos++];
    const fieldNum = tag >> 3;
    const wireType = tag & 0x7;
    if (wireType === 2) {
      let len = 0, shift = 0;
      while (true) {
        const b = res.body[pos++];
        len |= (b & 0x7f) << shift;
        if (!(b & 0x80)) break;
        shift += 7;
      }
      if (fieldNum === 1) encrypted = res.body.slice(pos, pos + len);
      pos += len;
    } else break;
  }
  return encrypted;
}

async function main() {
  const channel = process.argv[2] || 'rally-tv';
  const knownPlaintext = process.argv[3] || 'https://rally-tv-live.akamaized.net/hls/live/2117704/RallyTV-Pri/master.m3u8';

  console.log('Loading WASM binary...');
  const wasm = fs.readFileSync('gasm_rally-tv.wasm');
  
  console.log('Fetching encrypted blob...');
  const encrypted = await getEncryptedBlob(channel);
  console.log(`Got ${encrypted.length} bytes encrypted`);
  
  const known = Buffer.from(knownPlaintext, 'utf8');
  
  // Strategy: Try 32-byte windows from WASM as ChaCha20 key
  // For each key, try common nonces (all zeros, sequential)
  // Check if decryption of first 8 bytes matches 'https://'
  
  const MAGIC = Buffer.from('https://', 'utf8'); // first 8 bytes of plaintext
  let found = 0;
  
  console.log(`Scanning ${wasm.length - 44} positions in WASM for key+nonce pairs...`);
  
  for (let keyOffset = 0; keyOffset <= wasm.length - 32; keyOffset++) {
    const key = wasm.slice(keyOffset, keyOffset + 32);
    
    // Try a few nonce options
    const nonceOptions = [
      Buffer.alloc(12, 0),           // all zeros nonce (most common)
      wasm.slice(keyOffset + 32, keyOffset + 44), // immediately following bytes
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), // counter=1
    ];
    
    for (const nonce of nonceOptions) {
      try {
        const stream = chacha20(new Uint8Array(key), new Uint8Array(nonce), new Uint8Array(encrypted));
        const decrypted = Buffer.from(stream);
        
        // Check if it starts with 'https://'
        if (decrypted.slice(0, 8).equals(MAGIC)) {
          found++;
          const url = decrypted.toString('utf8').split('\0')[0].split('\n')[0];
          console.log(`\n✅ FOUND KEY at WASM offset ${keyOffset}!`);
          console.log(`   Key: ${key.toString('hex')}`);
          console.log(`   Nonce: ${nonce.toString('hex')}`);
          console.log(`   Decrypted: ${url}`);
          if (found > 3) {
            console.log('Found enough candidates, stopping scan');
            return;
          }
        }
      } catch(e) {}
    }
  }
  
  if (found === 0) {
    console.log('No key found with basic scan. The key may be derived at runtime.');
    console.log('Next step: look at what init_wasm() sets up in the WASM, or trace the key derivation.');
  }
}

main().catch(console.error);
