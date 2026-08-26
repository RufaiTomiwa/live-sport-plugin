const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(WVINNi1\)\{t5Y3z3p=xwy5d8\[0x148\]\}/g;
let m = content.match(regex);
console.log(m ? "Found" : "Not Found");
