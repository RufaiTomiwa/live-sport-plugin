const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// The error was CAUGHT TypeError: Right-hand side of 'instanceof' is not an object
// Wait! Maybe the error is not thrown directly by instanceof, but it's evaluated inside Wasm, and Wasm throws?
// "at 8cCReK ... at T59HXD ... at Object.OwcZwb ... at wasm://..."
// Ah! Wasm calls OwcZwb. OwcZwb calls T59HXD. T59HXD calls 8cCReK.
// 8cCReK has the instanceof that throws!!

let m = content.match(/function 8cCReK.*?\{.*?\}/);
console.log(m ? m[0] : "Not found!");
