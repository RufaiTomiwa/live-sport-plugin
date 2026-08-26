const fs = require('fs');

if (!fs.existsSync('full_mem.bin')) {
    console.log('No full_mem.bin');
    process.exit(1);
}

const mem = fs.readFileSync('full_mem.bin');
const goat = fs.readFileSync('goat.txt', 'utf8').trim();
const body = fs.readFileSync('body.bin');
const nonce = Buffer.from(goat, 'base64');
const ciphertext = body.subarray(3); // assuming first 3 bytes are protobuf header

console.log('Nonce hex:', nonce.toString('hex'));
console.log('Ciphertext len:', ciphertext.length);

const nonceIdx = mem.indexOf(nonce);
console.log('Nonce full found in mem at:', nonceIdx);

const nonce12 = nonce.subarray(0, 12);
const nonce12Idx = mem.indexOf(nonce12);
console.log('Nonce 12-byte found in mem at:', nonce12Idx);

const ciphertextIdx = mem.indexOf(ciphertext);
console.log('Ciphertext full found in mem at:', ciphertextIdx);

const ct16 = ciphertext.subarray(0, 16);
const ct16Idx = mem.indexOf(ct16);
console.log('Ciphertext 16-byte found in mem at:', ct16Idx);

