const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x2\]/g;
let m;
let c = 0;
while ((m = regex.exec(content)) !== null) {
    c++;
}
console.log(c);
