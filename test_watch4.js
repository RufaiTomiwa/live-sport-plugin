const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('/api/proxy-embed');
console.log(code.substring(idx + 1000, idx + 2000));
