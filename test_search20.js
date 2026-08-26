const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function T59HXD\(.*?if\(typeof jt3IoMo\[MNLhUC8.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]=Ab63Qb0\(KuDan1\[MNLhUC8\[xwy5d8\[0x2\]\]\]\)\}(.*?)\}/s;
const m = content.match(regex);
if (m) console.log(m[1].substring(0, 500));
