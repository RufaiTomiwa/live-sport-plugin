const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('/watch');
console.log(code.substring(idx - 100, idx + 2000));
