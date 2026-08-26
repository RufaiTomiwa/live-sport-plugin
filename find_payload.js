const fs = require('fs');
const mem = fs.readFileSync('wasm_mem_dump.bin');
const target = Buffer.from('29647c5b6b60614b69265e63604d6160', 'hex');
const idx = mem.indexOf(target);
if (idx !== -1) {
    console.log('Found payload at offset:', idx);
    // Print 64 bytes before and 64 bytes after
    const start = Math.max(0, idx - 64);
    const end = Math.min(mem.length, idx + 64);
    console.log('Context:', mem.subarray(start, end).toString('hex'));
} else {
    console.log('Payload not found in memory dump');
}
