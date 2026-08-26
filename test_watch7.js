const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('playM3u8(');
console.log(code.substring(idx - 500, idx + 1000));
