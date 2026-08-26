const fs = require('fs');
let content = fs.readFileSync('lock_mod9.js', 'utf-8');

// The crash happens inside T59HXD when MNLhUC8 === "67CHo7".
// Let's print out what jt3IoMo is for 67CHo7.
// Actually, T59HXD doesn't just do jt3IoMo[MNLhUC8]. It does something crazy!
const t5Match = content.match(/function T59HXD\(.*?\{.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export/s);
if (t5Match) {
    const fnBody = t5Match[1];
    let newFnBody = fnBody.replace(/if\(typeof jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]===x5lBJ_\(xwy5d8\[0x2\]\)\)\{/g,
    'console.log("INSIDE typeof jt3IoMo"); if(typeof jt3IoMo[MNLhUC8[xwy5d8[0x2]]]===x5lBJ_(xwy5d8[0x2])){');
    content = content.replace(fnBody, newFnBody);
    fs.writeFileSync('lock_mod10.js', content);
}
