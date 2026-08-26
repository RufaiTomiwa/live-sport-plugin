const fs = require('fs');
let content = fs.readFileSync('lock_mod8.js', 'utf-8');

// The output "T59HXD START 67CHo7" comes from: console.log("T59HXD START", MNLhUC8);
// So MNLhUC8 is exactly "67CHo7" !
// Where is "67CHo7" stored? It's passed to T59HXD!
// T59HXD uses MNLhUC8 to look up in jt3IoMo.
// If it crashes inside T59HXD, let's just log every step of T59HXD when MNLhUC8 == "67CHo7"!
content = content.replace('console.log("T59HXD START", MNLhUC8);', 'if (MNLhUC8 === "67CHo7") { console.log("HITTING 67CHo7!"); } console.log("T59HXD START", MNLhUC8);');
fs.writeFileSync('lock_mod9.js', content);
