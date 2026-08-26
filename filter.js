const fs = require('fs');
const lines = fs.readFileSync('wasm_strings.txt', 'utf8').split('\n');
const filtered = lines.filter(l => !l.includes('locked_bg') && !l.includes('rust') && !l.includes('cargo') && !l.includes('wbg') && !l.includes('wbindgen'));
console.log(filtered.join('\n'));
