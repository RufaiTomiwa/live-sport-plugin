const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /tdEyx0\([^\)]+\)/g;
let m;
let c = 0;
while ((m = regex.exec(content)) !== null) {
    c++;
}
console.log(c);
