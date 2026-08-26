const fs = require('fs');
let content = fs.readFileSync('lock_mod3.js', 'utf-8');
console.log(content.substring(0, 100));
console.log(content.indexOf('Unexpected token'));
