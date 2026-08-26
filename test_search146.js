const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// It's still matching some variable name or string.
// Let's do a strict match for [something] = function
let lines = content.replace(/,/g, ',\n').split('\n');
let m = lines.find(l => l.includes('__wbg_new_b5d9e2fb389fef91'));
console.log(m);
