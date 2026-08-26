const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

console.log(content.indexOf('wasm'));
console.log(content.indexOf('new_'));
