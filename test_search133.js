const fs = require('fs');
let mem = fs.readFileSync('wasm_mem.bin');
let text = "";
for(let i=0; i<mem.length; i++){
    if (mem[i] >= 32 && mem[i] <= 126) {
        text += String.fromCharCode(mem[i]);
    } else {
        text += '\n';
    }
}
let lines = text.split('\n').filter(l => l.length >= 10);
let uniqueLines = [...new Set(lines)];

const fs2 = require('fs');
fs2.writeFileSync('wasm_strings.txt', uniqueLines.join('\n'));
console.log("Dumped " + uniqueLines.length + " strings");
