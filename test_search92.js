const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(.*?\)\{return .*? instanceof.*?\}/;
let m = content.match(regex);
console.log(m ? m[0] : "Not found");
