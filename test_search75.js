const fs = require('fs');
let content = fs.readFileSync('lock_mod14.js', 'utf-8');

// The error is still swallowed, throwing undefined.
// Where does it throw undefined?
// catch(e) { console.log("INNER SET_STREAM ERROR:", e); throw e; }
// The output is INNER SET_STREAM ERROR: 
// So the promise is rejected with undefined.
// T59HXD returns a Promise. Why?
// Because T59HXD contains wait ZJbr9VM(tdEyx0(xwy5d8[0x538])).
// ZJbr9VM is WebAssembly.instantiate!
// Ah!!! ZJbr9VM(tdEyx0(xwy5d8[0x538]))
// xwy5d8[0x538] -> "instantiateStreaming" or "instantiate" maybe?
// Wait, ZJbr9VM is just WebAssembly.
const regex = /ZJbr9VM.*?\{.*?\}/s;
console.log(content.substring(0, 100));
