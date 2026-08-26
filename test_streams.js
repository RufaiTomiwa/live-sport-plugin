const fs = require('fs');
console.log(fs.readFileSync('src/streams.js', 'utf8').substring(0, 1500));
