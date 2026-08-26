const fs = require('fs');
const content = fs.readFileSync('locked_bg.js', 'utf8');
const wbindgen = content.includes('__wbindgen');
console.log('Contains __wbindgen:', wbindgen);
const wasmMatch = content.match(/WebAssembly\.(instantiate|compile)/);
console.log('Contains WebAssembly:', wasmMatch !== null);
