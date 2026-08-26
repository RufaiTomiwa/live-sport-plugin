const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /export function set_stream_jw.*?\{.*?\}/s;
const m = content.match(regex);
if (m) console.log(m[0]);
else console.log("Not found as export function");
