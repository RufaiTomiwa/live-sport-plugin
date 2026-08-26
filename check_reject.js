const fs = require('fs');
const code = fs.readFileSync('lock_patched.mjs', 'utf8');
const rejectMatches = code.match(/reject\(['"]{2}\)/g);
console.log('Found empty rejects:', rejectMatches);
