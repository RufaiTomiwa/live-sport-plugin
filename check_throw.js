const fs = require('fs');
const code = fs.readFileSync('lock_patched.mjs', 'utf8');
const throwMatches = code.match(/throw\s+['"]{2}/g);
console.log('Found empty throws:', throwMatches);
