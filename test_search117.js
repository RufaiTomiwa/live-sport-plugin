const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const regex = /catch\([a-zA-Z0-9]+\)\{.*?instanceof.*?\}/g;
let m = content.match(regex);
console.log(m ? m.length : 0);
if(m) {
    for (let x of m) {
        console.log(x);
    }
}
