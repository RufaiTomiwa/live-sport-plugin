const fs = require('fs');
let code = fs.readFileSync('src/providers/EmbedIndiaProvider.js', 'utf8');
let idx = code.indexOf('async resolveStream');
console.log(code.substring(idx, idx + 1000));
