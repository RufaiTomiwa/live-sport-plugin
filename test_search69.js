const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x430\]/g;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');

// We know EKpURm is evaluating it.
// EKpURm=function(...MNLhUC8){MNLhUC8[0]=4;if(typeof jt3IoMo[MNLhUC8[2]]===x5lBJ_(2)){return jt3IoMo[MNLhUC8[2]]=Ab63Qb0(KuDan1[MNLhUC8[2]])}return jt3IoMo[MNLhUC8[2]]}
// What is Ab63Qb0?
// Ab63Qb0 is MNLhUC8[x5lBJ_(xwy5d8[0x580])] || String.
// KuDan1 is [function(){return globalThis}, ...] etc. It's the array returned by HLCT0x().
// Wait, no.
// KuDan1 here is the array of strings that 	dEyx0 decodes from!
// No, wait, in T59HXD:
// ar WVINNi1={[tdEyx0...
// Ab63Qb0 is a string decryptor!
// Yes, I19soH0 is used by 	dEyx0.
// Let's print out what Ab63Qb0(KuDan1[MNLhUC8[xwy5d8[0x2]]]) is when it fails!
