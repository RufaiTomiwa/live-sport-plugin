const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /export function set_stream_jw.*?\{.*?\}/s;
const m = content.match(regex);

const idx = content.indexOf('export function set_stream_jw');
console.log(content.substring(idx, idx + 500));
