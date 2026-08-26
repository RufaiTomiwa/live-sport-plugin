const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const t5Match = content.match(/return Ab63Qb0 instanceof ZJbr9VM\(tdEyx0\(xwy5d8\[0x538\]\)\)\[tdEyx0\(xwy5d8\[0x546\]\)\+xwy5d8\[0x533\]\]\?\{\[tdEyx0\(xwy5d8\[0x532\]\)\+xwy5d8\[0x533\]\]:Ab63Qb0,\[tdEyx0\(xwy5d8\[0x523\]\)\]:x5lBJ_\}:Ab63Qb0/);
if (t5Match) {
    console.log("Found instanceof return. Let's trace it back to its function.");
    let text = content.substring(Math.max(0, t5Match.index - 500), t5Match.index + 200);
    console.log(text);
}
