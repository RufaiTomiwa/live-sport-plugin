const fs = require('fs');

const content = fs.readFileSync('lock.js', 'utf8');
const wbindgen = content.includes('wbindgen');
console.log('Contains wbindgen:', wbindgen);
const wasmMatch = content.match(/WebAssembly/);
console.log('Contains WebAssembly:', wasmMatch !== null);
const jsbg = content.match(/_bg/);
console.log('Contains _bg:', jsbg !== null);
