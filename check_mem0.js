const fs = require('fs');
const mem0 = fs.readFileSync('full_dump_0.bin');

const inner = fs.readFileSync('fetch_payload.bin').subarray(3);
const m3u8Bytes = Buffer.from('playlist.m3u8');

const idxM3u8 = mem0.indexOf(m3u8Bytes);
const idxCipher = mem0.indexOf(inner);

console.log('M3U8 found in mem0 at:', idxM3u8);
console.log('Ciphertext found in mem0 at:', idxCipher);

