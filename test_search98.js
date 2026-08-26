const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
console.log(content.substring(263000, 264000));
