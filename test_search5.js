const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

console.log(content.indexOf('wbg'));
console.log(content.indexOf('wbindgen'));
