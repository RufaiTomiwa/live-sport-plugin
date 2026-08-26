const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\([a-zA-Z0-9]+\)\{return [a-zA-Z0-9]+ instanceof.*?\?.*?:.*?\}/s;
let m = content.match(regex);
console.log(m ? m[0] : "Not found!");
