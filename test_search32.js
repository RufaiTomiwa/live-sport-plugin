const fs = require('fs');
let content = fs.readFileSync('lock_mod.js', 'utf-8');
content = content.replace(/function T59HXD\(.*?\)\{/, 'function T59HXD(MNLhUC8,PoVL2i,t5Y3z3p,WVINNi1=undefined){console.log("T59HXD CALLED!");');
fs.writeFileSync('lock_mod2.js', content);
