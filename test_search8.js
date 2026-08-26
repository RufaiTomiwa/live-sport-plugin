const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const index = content.indexOf('set_stream_jw');
console.log(content.substring(index - 50, index + 300));
