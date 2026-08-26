const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function tdEyx0\(.*?(return .*?)\}function/s;
const m = content.match(regex);
console.log(m[0]);
