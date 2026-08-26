const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const t5Match = content.match(/function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p,WVINNi1=.*?\{/);
const orig = t5Match[0];

const replaced = content.replace(orig, orig + ' console.log("T59HXD START", MNLhUC8); ');
fs.writeFileSync('lock_mod5.js', replaced);
