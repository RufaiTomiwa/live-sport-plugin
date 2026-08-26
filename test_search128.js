const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// The error we get is: 
// CAUGHT TypeError: Right-hand side of 'instanceof' is not an object
//     at 8cCReK (file:///C:/Users/odeda/Desktop/Projects/Nuvio%20Live%20Sports%20Plugin/lock_mod16.js:10:263805)
//     at T59HXD (file:///C:/Users/odeda/Desktop/Projects/Nuvio%20Live%20Sports%20Plugin/lock_mod16.js:10:278745)
// Let's replace ALL instanceof with a function wrapper:
// __is_instanceof(A, B)
// Or just let it evaluate, but we can replace A instanceof B with (B !== undefined && typeof B === 'function' ? (A instanceof B) : false)!

const regex = /([a-zA-Z0-9_\[\]\(\)\+]+)\s+instanceof\s+([a-zA-Z0-9_\[\]\(\)\+]+)/g;
let c = 0;
content = content.replace(regex, (match, a, b) => {
    // some b might have property access, e.g. ZJbr9VM(...)[...]
    // It's hard to parse correctly.
    c++;
    return '(false)'; // Just replace all with false!
});
fs.writeFileSync('lock_mod20.js', content);
console.log('Replaced ' + c);
