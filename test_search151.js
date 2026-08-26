const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// The stack trace says:
// at Object.asBDA9 (lock.js:10:276211)
let idx = content.indexOf('asBDA9');
console.log(content.substring(idx - 100, idx + 200));

console.log("---------------");

let idx2 = 276211; // We can't trust byte offsets perfectly with utf-8 maybe, but let's try
console.log(content.substring(idx2 - 100, idx2 + 100));

