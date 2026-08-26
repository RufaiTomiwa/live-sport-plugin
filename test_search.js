const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');
const index = content.indexOf('b5d9e2fb389fef91');
console.log(content.substring(index - 50, index + 200));
