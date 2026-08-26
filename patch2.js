const fs = require('fs');
let code = fs.readFileSync('lock_patched.mjs', 'utf8');
code = code.replace(/throw PoVL2i\}/g, 'throw new Error(PoVL2i)}');
fs.writeFileSync('lock_patched2.mjs', code);
