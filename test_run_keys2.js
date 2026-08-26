const fs = require('fs');
if (!fs.existsSync('run_mem.bin')) { console.log('NO FILE'); process.exit(1); }

const mem = fs.readFileSync('run_mem.bin');
let cipher = fs.readFileSync('run_cipher.bin');
if (cipher.length === 179) cipher = cipher.subarray(3);
const m3u8 = fs.readFileSync('run_m3u8.txt', 'utf8');
const goat = fs.readFileSync('run_goat.txt', 'utf8').trim();

const nonce = Buffer.from(goat, 'base64');
console.log('Nonce:', nonce.toString('hex'));

const cipherIdx = mem.indexOf(cipher);
console.log('Cipher found at:', cipherIdx);

const m3u8Idx = mem.indexOf(Buffer.from(m3u8));
console.log('M3U8 found at:', m3u8Idx);
