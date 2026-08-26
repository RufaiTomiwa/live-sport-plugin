const fs = require('fs');
let mem = fs.readFileSync('wasm_mem.bin');

let target = "unwrap_throw";
let text = "";
for(let i=0; i<mem.length; i++){
    if (mem[i] >= 32 && mem[i] <= 126) {
        text += String.fromCharCode(mem[i]);
    } else {
        text += '.';
    }
}
let idx = text.indexOf(target);
if (idx !== -1) {
    console.log("Found error message at index:", idx);
    console.log("Context:", text.substring(idx - 50, idx + 100));
}
