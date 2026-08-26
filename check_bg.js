const fs = require('fs');

const bg = fs.readFileSync('locked_bg.js', 'utf8');
const lines = bg.split('\n');

const cryptoLines = lines.filter(l => l.includes('crypto') || l.includes('random'));
console.log('Crypto references in locked_bg.js:', cryptoLines);

