const fs = require('fs');
let code = fs.readFileSync('lock.js', 'utf8');
console.log('Has set_stream:', code.includes('set_stream'));
console.log('Has set_stream_jw:', code.includes('set_stream_jw'));
