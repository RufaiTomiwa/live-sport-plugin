const fs = require('fs');
let code = fs.readFileSync('lock.mjs', 'utf8');

// Replace ANY throw statement with a console log and return
code = code.replace(/throw[ \t]+([a-zA-Z0-9_]+)/g, 'console.log("suppressed throw of " + )');
fs.writeFileSync('lock_patched4.mjs', code);
