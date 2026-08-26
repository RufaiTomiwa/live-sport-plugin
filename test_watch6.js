const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('function playM3u8(m3u8)');
console.log(code.substring(idx - 500, idx + 1000));
