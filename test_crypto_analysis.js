// Cryptanalysis — figure out what cipher the WASM uses on the response blob
// We KNOW the plaintext output: https://rally-tv-live.akamaized.net/hls/live/2117704/RallyTV-Pri/master.m3u8
// We KNOW the ciphertext input (the response blob from embedindia.st/fetch)
// XOR the two to find the keystream / key pattern

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

async function main() {
  const channel = process.argv[2] || 'rally-tv';
  const knownPlaintext = process.argv[3] || 'https://rally-tv-live.akamaized.net/hls/live/2117704/RallyTV-Pri/master.m3u8';
  
  console.log(`Channel: ${channel}`);
  console.log(`Known plaintext: ${knownPlaintext}\n`);

  // Fetch the encrypted response
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

  console.log(`Response hex: ${res.body.toString('hex')}`);
  console.log(`Response len: ${res.body.length}`);

  // Parse the protobuf response
  // Field 1 (0x0a) = encrypted stream data
  // Field 2 (0x12) = channel name echoed
  // Let's parse manually
  let pos = 0;
  const fields = {};
  while (pos < res.body.length) {
    const tag = res.body[pos++];
    const fieldNum = tag >> 3;
    const wireType = tag & 0x7;
    if (wireType === 2) { // length-delimited
      // Read varint length
      let len = 0, shift = 0;
      while (true) {
        const b = res.body[pos++];
        len |= (b & 0x7f) << shift;
        if (!(b & 0x80)) break;
        shift += 7;
      }
      fields[fieldNum] = res.body.slice(pos, pos + len);
      pos += len;
    } else {
      console.log(`Unknown wire type ${wireType} at pos ${pos-1}`);
      break;
    }
  }

  console.log(`\nParsed proto fields:`);
  Object.entries(fields).forEach(([k, v]) => {
    console.log(`  Field ${k}: len=${v.length} hex=${v.toString('hex').slice(0,100)}`);
    console.log(`         utf8=${v.toString('utf8', 0, 100)}`);
  });

  const encrypted = fields[1]; // encrypted stream URL
  if (!encrypted) {
    console.log('No field 1 found');
    return;
  }

  const plaintext = Buffer.from(knownPlaintext, 'utf8');
  console.log(`\nEncrypted field 1 (hex): ${encrypted.toString('hex')}`);
  console.log(`Known plaintext    (hex): ${plaintext.toString('hex')}`);
  console.log(`Encrypted len: ${encrypted.length}, Plaintext len: ${plaintext.length}`);

  // XOR to get keystream
  const minLen = Math.min(encrypted.length, plaintext.length);
  const keystream = Buffer.alloc(minLen);
  for (let i = 0; i < minLen; i++) {
    keystream[i] = encrypted[i] ^ plaintext[i];
  }
  console.log(`\nXOR keystream (hex): ${keystream.toString('hex')}`);
  console.log(`XOR keystream (raw): ${JSON.stringify(keystream.toString('binary'))}`);

  // Check if it's a repeating key (simple XOR cipher)
  const maxKeyLen = 64;
  for (let keyLen = 1; keyLen <= maxKeyLen; keyLen++) {
    let isRepeating = true;
    for (let i = keyLen; i < keystream.length; i++) {
      if (keystream[i] !== keystream[i % keyLen]) {
        isRepeating = false;
        break;
      }
    }
    if (isRepeating) {
      const key = keystream.slice(0, keyLen);
      console.log(`\n✅ FOUND REPEATING KEY of length ${keyLen}!`);
      console.log(`   Key hex: ${key.toString('hex')}`);
      console.log(`   Key utf8: ${JSON.stringify(key.toString('utf8'))}`);
      
      // Verify by decrypting encrypted
      const decrypted = Buffer.alloc(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ key[i % keyLen];
      }
      console.log(`   Decrypted: ${decrypted.toString('utf8')}`);
      break;
    }
  }
}

main().catch(console.error);
