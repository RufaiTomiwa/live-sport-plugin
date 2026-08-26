const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// The line is: return Ab63Qb0 instanceof ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x546])+xwy5d8[0x533]]?{[tdEyx0(xwy5d8[0x532])+xwy5d8[0x533]]:Ab63Qb0,[tdEyx0(xwy5d8[0x523])]:x5lBJ_}:Ab63Qb0
// We can replace it with:
// return Ab63Qb0 instanceof WebAssembly.Instance ? ... : Ab63Qb0
const regex = /Ab63Qb0 instanceof ZJbr9VM\(tdEyx0\(xwy5d8\[0x538\]\)\)\[tdEyx0\(xwy5d8\[0x546\]\)\+xwy5d8\[0x533\]\]/g;
let replaced = content.replace(regex, 'Ab63Qb0 instanceof WebAssembly.Instance');
fs.writeFileSync('lock_mod19.js', replaced);
console.log("Replaced:", content !== replaced);
