const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\((.*?)\)\{return \1 instanceof/;
let match = content.match(regex);
if (match) {
    let start = Math.max(0, match.index - 200);
    console.log(content.substring(start, match.index + 200));
} else {
    console.log("Still not found?");
}
