const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const arrMatch = content.match(/const xwy5d8=\[(.*?)\]/s);
let arr = [];
if (arrMatch) {
    arr = JSON.parse('[' + arrMatch[1] + ']');
}

// We need to implement tdEyx0 to decode the strings
const tdEyx0 = function(idx) {
    // Actually tdEyx0 is in lock.js. Let's just extract it and run it.
}
