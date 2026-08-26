const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p,WVINNi1.*?if\(!EKpURm\)\{EKpURm=function\(\.\.\.MNLhUC8\)\{MNLhUC8\[xwy5d8\[0x0\]\]=xwy5d8\[0x4\];if\(typeof jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]===x5lBJ_\(xwy5d8\[0x2\]\)\)\{return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]=Ab63Qb0\(KuDan1\[MNLhUC8\[xwy5d8\[0x2\]\]\]\)\}/s;
const m = content.match(regex);
console.log(m ? m[0].substring(m[0].length - 100) : "Not found!");

// Let's replace it
if (m) {
    let replaced = content.replace('return jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]])',
    'try { return jt3IoMo[MNLhUC8[xwy5d8[0x2]]]=Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]]); } catch(e) { console.log("CRASH IN Ab63Qb0", MNLhUC8[xwy5d8[0x2]], KuDan1[MNLhUC8[xwy5d8[0x2]]]); throw e; }');
    fs.writeFileSync('lock_mod13.js', replaced);
}
