const fs = require('fs');
let code = fs.readFileSync('src/providers/EmbedIndiaProvider.js', 'utf8');
let idx = code.indexOf('Tier 2');
console.log(code.substring(idx, idx + 1000));
