const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /CAUGHT TypeError: Right-hand side of 'instanceof' is not an object/;
// wait, the error happened in lock_mod16.js, not lock.js.
// And it was inside T59HXD catch block catch(p1).
// Actually, earlier we logged:
// catch(PoVL2i){MNLhUC8[xwy5d8[0x87]]=xwy5d8[0x148]}const t5Y3z3p=MNLhUC8[xwy5d8[0x87]];return t5Y3z3p}
// No, the error stack trace was:
// at 8cCReK (file:///C:/Users/odeda/Desktop/Projects/Nuvio%20Live%20Sports%20Plugin/lock_mod16.js:10:263805)
// at T59HXD (file:///C:/Users/odeda/Desktop/Projects/Nuvio%20Live%20Sports%20Plugin/lock_mod16.js:10:278745)

console.log(content.substring(278461 - 200, 278461 + 200));
