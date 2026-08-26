const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const t5Match = content.match(/function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p.*?\{/);
const fnStart = t5Match.index;
const fnEnd = content.indexOf('export function switch_to_clappr_reuse', fnStart);
console.log(content.substring(fnStart, fnStart + 1000));
