const fs = require('fs');

const wasm = fs.readFileSync('lock.wasm');
const str = wasm.toString('utf8');

// find all ascii strings of length >= 8
let current = '';
const strings = [];
for (let i=0; i<wasm.length; i++) {
    const b = wasm[i];
    if (b >= 32 && b <= 126) {
        current += String.fromCharCode(b);
    } else {
        if (current.length >= 8) strings.push(current);
        current = '';
    }
}
fs.writeFileSync('wasm_strings.txt', strings.join('\n'));
console.log('Saved ' + strings.length + ' strings');
