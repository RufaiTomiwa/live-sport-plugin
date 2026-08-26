const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// wait, the error is:
// CAUGHT TypeError: Right-hand side of 'instanceof' is not an object
// at 8cCReK (lock_mod16.js)

let idx = content.indexOf('8cCReK');
console.log('8cCReK index:', idx);
if (idx !== -1) {
    console.log(content.substring(idx - 100, idx + 200));
}
