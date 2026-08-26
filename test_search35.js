const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// Find function T59HXD and add a try catch!
const t5Match = content.match(/function T59HXD\(MNLhUC8,PoVL2i,t5Y3z3p.*?\{/);
if (t5Match) {
    const idx = t5Match.index + t5Match[0].length;
    content = content.substring(0, idx) + 'console.log("T59HXD START", MNLhUC8); ' + content.substring(idx);
    
    // Also log inside set_stream_jw
    // The previous replace used $& which includes the matched string, but there's a problem with it maybe?
    // Let's use simple string replace
    content = content.replace('export function set_stream_jw(...x5lBJ_){', 'export function set_stream_jw(...x5lBJ_){console.log("SET STREAM JW CALLED!", x5lBJ_);');
}

fs.writeFileSync('lock_mod3.js', content);
