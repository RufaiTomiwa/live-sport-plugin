const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8'); // Has decode logs

const regex = /xwy5d8\[0x36\]/g;
let m = content.match(/function T59HXD\(.*?\{.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export function/s);

// In T59HXD, let's just log what 	dEyx0(xwy5d8[0x36]) is!
let fnStr = m[1];
fnStr = fnStr.replace(/catch\(([a-zA-Z0-9_]+)\)\{/g, (match, p1) => {
    return 'catch(' + p1 + '){ console.log("CAUGHT", ' + p1 + ', "tdEyx0:", tdEyx0(xwy5d8[0x36]));';
});
content = content.replace(m[1], fnStr);
fs.writeFileSync('lock_mod16.js', content);
