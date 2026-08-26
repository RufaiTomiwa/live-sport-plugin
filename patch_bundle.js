const fs = require('fs');
let code = fs.readFileSync('bundle-jw.js', 'utf8');
code = code.replace(/throw[ \t]+[a-zA-Z0-9_]+\}/g, '/* throw removed */}');
fs.writeFileSync('bundle-jw-patched.js', code);
