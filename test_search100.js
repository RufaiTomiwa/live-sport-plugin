const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(.*?\)\{return .*? instanceof.*?\?.*?:.*?\}/s;
let match = content.match(regex);
if (match) {
    console.log(match[0].substring(0, 300));
} else {
    console.log("No ternary catch instanceof");
}
