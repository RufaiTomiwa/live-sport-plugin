const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const t5Match = content.match(/function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p.*?\{/);
const orig = t5Match[0];
console.log("Original match:", orig);

const replaced = content.replace(orig, orig + ' console.log("T59HXD START", MNLhUC8); ');
fs.writeFileSync('lock_mod4.js', replaced);
