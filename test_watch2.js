const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');
let idx = code.indexOf('app.get(\'/watch\'');
console.log(code.substring(idx - 100, idx + 2000));
