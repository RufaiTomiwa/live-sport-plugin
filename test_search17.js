const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function set_stream_jw\(\.\.\.x5lBJ_\).*?return iXYgipw.*?T59HXD\(tdEyx0\([^\)]+\)\)\}/s;
const m = content.match(regex);
if (m) console.log(m[0]);
