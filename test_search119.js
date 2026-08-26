const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const t5Match = content.match(/catch\(PoVL2i\)\{return PoVL2i instanceof jt3IoMo\[tdEyx0\(xwy5d8\[0x36\]\)\]\?PoVL2i:jt3IoMo\[tdEyx0\(xwy5d8\[0x46\]\)\]\(jt3IoMo\[tdEyx0\(xwy5d8\[0x36\]\)\]\(PoVL2i\)\)\}/);
console.log(t5Match ? "Found" : "Not Found");
// We know catch(PoVL2i){return PoVL2i instanceof jt3IoMo[tdEyx0(xwy5d8[0x36])] exists in 8cCReK. Let's find 	dEyx0(xwy5d8[0x36]) globally!
const regex = /tdEyx0\(xwy5d8\[0x36\]\)/g;
let m = content.match(regex);
console.log(m ? m.length : 0);
