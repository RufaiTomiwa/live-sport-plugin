const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(PoVL2i\)\{MNLhUC8\[xwy5d8\[0x1\]\]=xwy5d8\[0x148\]\}/g;
let m = content.match(regex);
console.log(m ? "Found" : "Not Found");
