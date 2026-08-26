const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('/api/proxy-embed');
console.log(code.substring(idx + 2000, idx + 3000));
