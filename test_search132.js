const fs = require('fs');
let mem = fs.readFileSync('wasm_mem.bin');
let text = mem.toString('utf-8').replace(/[^\x20-\x7E]/g, '');

let match = text.match(/https:\/\/[A-Za-z0-9\-\.\/]+/g);
if (match) {
    let unique = [...new Set(match)];
    console.log(unique);
}

let m2 = text.match(/[A-Za-z0-9\-]+\.st\/[A-Za-z0-9\-\/]+/g);
if (m2) {
    let unique = [...new Set(m2)];
    console.log(unique);
}
