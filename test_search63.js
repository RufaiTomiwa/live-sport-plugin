const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const tM = content.match(/function tdEyx0\(MNLhUC8\)\{.*?\}/s);
content = content.replace(tM[0], tM[0].replace('return jt3IoMo[MNLhUC8]=I19soH0(KuDan1[MNLhUC8])', 'var res = I19soH0(KuDan1[MNLhUC8]); console.log("DECODE", MNLhUC8, res); return jt3IoMo[MNLhUC8]=res;'));

fs.writeFileSync('lock_mod12.js', content);
