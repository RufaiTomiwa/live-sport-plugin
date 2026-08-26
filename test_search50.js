const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /67CHo7/g;
let m;
while ((m = regex.exec(content)) !== null) {
    console.log(content.substring(m.index - 50, m.index + 50));
}

// Wait, the string "67CHo7" is actually passed to T59HXD.
// And T59HXD creates a function that calls WASM inside!
// Let's print out what T59HXD returns.
