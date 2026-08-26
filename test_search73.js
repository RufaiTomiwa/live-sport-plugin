const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /export function set_stream_jw.*?return iXYgipw=\[x5lBJ_,jt3IoMo\],(.*?\))}/s;
const m = content.match(regex);
console.log(m[1]);
