const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const t5Match = content.match(/async function T59HXD\(.*?\{.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export/s);
if(t5Match) {
    let fnStr = t5Match[1];
    fnStr = fnStr.replace(/catch\((.*?)\)\{/g, 'catch(){ console.log("CAUGHT", );');
    content = content.replace(t5Match[1], fnStr);
    fs.writeFileSync('lock_mod15.js', content);
}
