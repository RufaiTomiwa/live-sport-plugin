const fs = require('fs');
let content = fs.readFileSync('lock_mod7.js', 'utf-8');

// The string 67CHo7 comes from 	dEyx0(xwy5d8[...]).
// So T59HXD uses it to lookup a function maybe?
const match = content.match(/function T59HXD\(.*?\{.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export/s);
if (match) {
    const fnBody = match[1];
    // Let's hook before wait ZJbr9VM
    content = content.replace('const Ab63Qb0=await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](x5lBJ_,jt3IoMo)', 
    'console.log("WAITING ON ZJbr9VM"); const Ab63Qb0=await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](x5lBJ_,jt3IoMo); console.log("ZJbr9VM DONE");');
    fs.writeFileSync('lock_mod8.js', content);
}
