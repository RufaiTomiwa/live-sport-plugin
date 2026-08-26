const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');
const index = content.indexOf('wbg_new_');
console.log(content.substring(index - 50, index + 200));
