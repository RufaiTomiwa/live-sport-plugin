const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /export function set_stream_jw.*?\{.*?\}/s;
const m = content.match(regex);
console.log(m[0]);
