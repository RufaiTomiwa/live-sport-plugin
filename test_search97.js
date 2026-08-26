const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// The error we get is: 
// CAUGHT TypeError: Right-hand side of 'instanceof' is not an object
// at 8cCReK (lock_mod16.js:10:263805)

let m = content.match(/function 8cCReK.*?\{.*?\}/s);
if (!m) {
    // maybe 8cCReK is not a function statement?
    m = content.match(/8cCReK.*?\{.*?\}/s);
    if(m) console.log(m[0].substring(0, 500));
}
