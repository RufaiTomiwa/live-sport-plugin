const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('extractM3u8(html)');
console.log(code.substring(idx, idx + 1500));
