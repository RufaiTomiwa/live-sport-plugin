const fs = require('fs');
const mem = fs.readFileSync('wasm_mem_dump.bin');
const target = Buffer.from('expand 32-byte k');
const idx = mem.indexOf(target);
if (idx !== -1) {
    console.log('Found expand 32-byte k at:', idx);
    console.log('Context:', mem.subarray(Math.max(0, idx - 64), idx + 64).toString('hex'));
} else {
    console.log('Not found');
}
