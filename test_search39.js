const fs = require('fs');
const content = fs.readFileSync('lock_mod4.js', 'utf-8');

// Find the Unexpected token '.' error!
// Where is it?
const idx = content.indexOf('...');
console.log(content.substring(idx - 50, idx + 50));
