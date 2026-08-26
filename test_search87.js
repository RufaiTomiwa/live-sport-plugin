const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const t5Match = content.match(/catch\(PoVL2i\)\{return PoVL2i instanceof jt3IoMo\[tdEyx0\(xwy5d8\[0x36\]\)\]\?PoVL2i:jt3IoMo\[tdEyx0\(xwy5d8\[0x46\]\)\]\(jt3IoMo\[tdEyx0\(xwy5d8\[0x36\]\)\]\(PoVL2i\)\)\}/);
console.log(t5Match ? "Found it in lock.js directly" : "Not found");
