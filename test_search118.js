const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(PoVL2i\)\{const t5Y3z3p=x5lBJ_\[xwy5d8\[0x53c\]\]&&MNLhUC8\(x5lBJ_\[tdEyx0\(xwy5d8\[0x53d\]\)\]\);.*?Ab63Qb0 instanceof ZJbr9VM\(tdEyx0\(xwy5d8\[0x538\]\)\)\[tdEyx0\(xwy5d8\[0x546\]\)\+xwy5d8\[0x533\]\]/s;
let match = content.match(regex);
if (match) {
    let replaced = content.replace(match[0], match[0].replace(/Ab63Qb0 instanceof [^?]+/, '(false /* bypassed */)'));
    fs.writeFileSync('lock_mod18.js', replaced);
    console.log("Replaced!");
}
