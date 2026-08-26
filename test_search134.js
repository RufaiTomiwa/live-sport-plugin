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
// We want to see what is around "variants=[{label:"1080p",file:"
// Or around "admin-tennis-channel/1"
const target = "nnis-channel/1";
let idx = text.indexOf(target);
if (idx !== -1) {
    console.log(text.substring(idx - 100, idx + 100));
}
