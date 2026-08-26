const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');

// We need to decode tdEyx0(xwy5d8[...])! 
// Let's hook tdEyx0 in our proxy!
