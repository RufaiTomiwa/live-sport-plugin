const fs = require('fs');
const mem = fs.readFileSync('wasm_mem_before_m3u8.bin');

// This is 2048 bytes before ptr=1115400 (or 1115752).
// Could the 32 byte key be here?
for (let i = 0; i < mem.length - 32; i += 8) {
    const chunk = mem.subarray(i, i+32);
    // console.log(chunk.toString('hex'));
}
// We have the goat nonce. It's base64 in the headers. Let's read it.
const nonceB64 = fs.readFileSync('goat_nonce.txt', 'utf8').trim();
const nonce = Buffer.from(nonceB64, 'base64');
console.log('Nonce hex:', nonce.toString('hex'));

const nonceIdx = mem.indexOf(nonce);
console.log('Nonce found in mem at:', nonceIdx);

// Check if first 12 bytes of nonce are found
const nonce12 = nonce.subarray(0, 12);
const nonce12Idx = mem.indexOf(nonce12);
console.log('Nonce 12-byte found in mem at:', nonce12Idx);
