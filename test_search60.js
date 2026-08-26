const fs = require('fs');
let content = fs.readFileSync('lock_mod10.js', 'utf-8');

content = content.replace('return jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]])',
'console.log("EVALUATING:", MNLhUC8[xwy5d8[0x2]]); return jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]])');

fs.writeFileSync('lock_mod11.js', content);
