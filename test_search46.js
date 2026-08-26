const fs = require('fs');
let content = fs.readFileSync('lock_mod7.js', 'utf-8');

// The promise is rejected with undefined.
// Let's hook 67CHo7
// Wait, the output is T59HXD START 67CHo7, and then immediately [PROMISE REJECTED]
// Meaning 67CHo7 is the function that rejects!
const regex = /function 67CHo7.*?\{.{0,500}/s;
const m = content.match(regex);
if (m) console.log(m[0]);
