const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// Find function T59HXD and add a try catch!
const t5Match = content.match(/function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p.*?\{/);
if (t5Match) {
    const idx = t5Match.index + t5Match[0].length;
    // Actually, just let's inject a console.log!
    content = content.substring(0, idx) + 'console.log("T59HXD START", MNLhUC8); ' + content.substring(idx);
    
    // Also log inside set_stream_jw
    content = content.replace(/export function set_stream_jw\(.*?\{/, '$&console.log("SET STREAM JW CALLED!", x5lBJ_);');
}

fs.writeFileSync('lock_mod3.js', content);
