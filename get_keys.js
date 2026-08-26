const fs = require('fs');
const wasm = fs.readFileSync('lock.wasm');

// Extract all 32-byte chunks and 16-byte chunks in the .data segment
const dataStart = 0; // We can just search the whole WASM
let keys = [];

for (let i = 0; i < wasm.length - 32; i++) {
    // Only grab chunks that don't have printable ASCII 
    // to filter out text, but it might be better to just grab everything
    const chunk = wasm.subarray(i, i + 32);
    // Check if it's completely printable
    let isPrintable = true;
    for (let j = 0; j < 32; j++) {
        if (chunk[j] < 32 || chunk[j] > 126) { isPrintable = false; break; }
    }
    if (!isPrintable) {
        keys.push(chunk.toString('hex'));
    }
}
console.log('Keys generated:', keys.length);
