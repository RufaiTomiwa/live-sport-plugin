const fs = require('fs');
let content = fs.readFileSync('lock_mod8.js', 'utf-8');

// The crash happens inside 67CHo7.
// Let's print out what 67CHo7 is doing!
const regex = /function 67CHo7.*?\{.{0,500}/s;
const m = content.match(regex);
console.log(m[0]);
