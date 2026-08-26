const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x36\]/g;
let m = content.match(regex);
console.log(m ? m.length : 0);
