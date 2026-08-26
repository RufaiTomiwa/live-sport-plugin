const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const matches = content.match(/function set_stream_jw.*?\}/g);
console.log(matches);
