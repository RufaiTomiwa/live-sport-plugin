const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// The crash happens inside T59HXD on 67CHo7 right after INSIDE typeof jt3IoMo.
// That line is: eturn jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]])
// Let's print out what Ab63Qb0 and KuDan1 and MNLhUC8[xwy5d8[0x2]] are!
const t5Match = content.match(/function T59HXD\(.*?\{.*?if\(!EKpURm\)\{EKpURm=function\(\.\.\.MNLhUC8\).*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]=Ab63Qb0\(KuDan1\[MNLhUC8\[xwy5d8\[0x2\]\]\]\)\}(.*?)\}export/s);

// We want to hook Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]]).
content = fs.readFileSync('lock_mod10.js', 'utf-8');
content = content.replace('return jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]])',
'console.log("EVALUATING:", MNLhUC8[xwy5d8[0x2]], KuDan1); return jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]])');

fs.writeFileSync('lock_mod11.js', content);
