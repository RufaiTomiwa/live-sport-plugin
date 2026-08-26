const fs = require('fs');

const mem = fs.readFileSync('wasm_mem.bin');
let idx = mem.indexOf(Buffer.from('254b59607d4417e9dffbc307138ae5c8', 'hex'));
console.log('Hex chunk 1:', idx);

idx = mem.indexOf(Buffer.from('29647c5b6b60614b69265e63604d6160', 'hex'));
console.log('Hex chunk 2:', idx);

