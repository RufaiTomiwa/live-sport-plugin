const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /Ab63Qb0 instanceof ZJbr9VM\(tdEyx0\(xwy5d8\[0x538\]\)\)\[tdEyx0\(xwy5d8\[0x546\]\)\+xwy5d8\[0x533\]\]/;
let m = content.match(regex);
content = content.replace(m[0], 'false /* bypassed instanceof */');
fs.writeFileSync('lock_mod17.js', content);
