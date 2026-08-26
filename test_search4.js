const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /__wbg_[a-zA-Z0-9_]+/g;
const matches = [...new Set(content.match(regex))];
console.log(matches.slice(0, 50));
