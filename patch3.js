const fs = require('fs');
let code = fs.readFileSync('lock_patched.mjs', 'utf8');

// The throw is inside a function that probably has a condition!
// Let's just remove the throw completely!
code = code.replace(/throw PoVL2i/g, '/* removed throw */');

fs.writeFileSync('lock_patched3.mjs', code);
