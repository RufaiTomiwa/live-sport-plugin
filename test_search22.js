const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p,WVINNi1=.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export/s;
const m = content.match(regex);
if (m) console.log(m[1].length);
