const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const t5Match = content.match(/function T59HXD\(.*?\{.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export function/s);
if(t5Match) {
    let fnStr = t5Match[1];
    
    // Instead of replacing blindly, we can hook it at the Promise returning part
    // The exact lines are: catch(PoVL2i){return PoVL2i instanceof jt3IoMo[tdEyx0(xwy5d8[0x36])]?PoVL2i:jt3IoMo[tdEyx0(xwy5d8[0x46])](jt3IoMo[tdEyx0(xwy5d8[0x36])](PoVL2i))}
    // Let's console.log that PoVL2i.
    
    fnStr = fnStr.replace(/catch\(PoVL2i\)\{/g, 'catch(PoVL2i){ console.log("CAUGHT", PoVL2i);');
    content = content.replace(t5Match[1], fnStr);
    fs.writeFileSync('lock_mod15.js', content);
    console.log("Replaced successfully!");
} else {
    console.log("No match");
}
