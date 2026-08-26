const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(PoVL2i\)\{.*?instanceof.*?\}/s;
let m = content.match(regex);
console.log(m ? m[0].substring(0, 100) : "Not found!");
