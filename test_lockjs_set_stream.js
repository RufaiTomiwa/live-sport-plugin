const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf8');
const match = content.match(/set_stream\s*\([^)]*\)/g);
console.log(match);
