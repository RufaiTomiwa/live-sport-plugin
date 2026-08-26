const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(.*?\)\{return .*? instanceof jt3IoMo\[tdEyx0\(xwy5d8\[0x36\]\)\]\?.*?:jt3IoMo\[tdEyx0\(xwy5d8\[0x46\]\)\]\(jt3IoMo\[tdEyx0\(xwy5d8\[0x36\]\)\]\(.*?\)\)\}/;
let m = content.match(regex);
console.log(m ? "Found general catch block" : "Not found");
