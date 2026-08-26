const fs = require('fs');
const code = fs.readFileSync('lock.js', 'utf8');
console.log(code.substring(108969 - 100, 108969 + 100));
