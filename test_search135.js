const fs = require('fs');
let mem = fs.readFileSync('wasm_mem.bin');
let text = "";
for(let i=0; i<mem.length; i++){
    if (mem[i] >= 32 && mem[i] <= 126) {
        text += String.fromCharCode(mem[i]);
    } else {
        text += '.';
    }
}
let match = text.match(/http[A-Za-z0-9\-\.\/:\?]+/g);
if (match) {
    let unique = [...new Set(match)];
    console.log(unique);
}
