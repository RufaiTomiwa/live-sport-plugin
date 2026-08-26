const fs = require('fs');
const memWrite = fs.readFileSync('mem_at_write.bin');
const fullFetchPayload = fs.readFileSync('fetch_payload.bin');

const idx = memWrite.indexOf(fullFetchPayload);
console.log('Full payload found in memWrite at:', idx);

const buf = memWrite.subarray(1115384, 1115384 + 179);
console.log('Is 1115384 all zeros?', buf.every(b => b === 0));

// Wait! If the write happens asynchronously (e.g. WASM copies it, but we took the dump too early?), let's check memDecode for the payload.
const memDecode = fs.readFileSync('mem_at_decode.bin');
console.log('Full payload found in memDecode at:', memDecode.indexOf(fullFetchPayload));

