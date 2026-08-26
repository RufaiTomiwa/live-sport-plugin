const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const t5Match = content.match(/function T59HXD\(.*?\{.*?return jt3IoMo\[MNLhUC8\[xwy5d8\[0x2\]\]\]\}(.*?)\}export function/s);
if(t5Match) {
    let fnStr = t5Match[1];
    
    // There might be another instanceof in T59HXD.
    let count = 0;
    fnStr = fnStr.replace(/instanceof\s+([a-zA-Z0-9_\[\]\(\)\+]+)/g, (match, p1) => {
        count++;
        // wrap it with false
        return '/* bypassed */ (false) ';
    });
    content = content.replace(t5Match[1], fnStr);
    fs.writeFileSync('lock_mod18.js', content);
    console.log("Replaced " + count + " instanceof successfully!");
} else {
    console.log("No match");
}
