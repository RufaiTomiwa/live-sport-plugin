const fs = require('fs');
const memWrite = fs.readFileSync('mem_at_write.bin');
const memDecode = fs.readFileSync('mem_at_decode.bin');
const ciphertext = fs.readFileSync('fetch_payload.bin').subarray(3);

console.log('Bytes at 1115384 in memWrite:', memWrite.subarray(1115384, 1115384 + 32).toString('hex'));
console.log('Actual ciphertext starts with:', ciphertext.subarray(0, 32).toString('hex'));

const fullFetchPayload = fs.readFileSync('fetch_payload.bin');
console.log('Bytes at 1115384 vs Full payload:', fullFetchPayload.subarray(0, 32).toString('hex'));

// Wait! Is the payload written to WASM exactly?
if (memWrite.subarray(1115384, 1115384 + 32).toString('hex') === fullFetchPayload.subarray(0, 32).toString('hex')) {
    console.log('YES! The FULL payload (including tag) is written to WASM.');
}

