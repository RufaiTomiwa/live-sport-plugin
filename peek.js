const fs = require('fs');
let code = fs.readFileSync('src/providers/EmbedIndiaProvider.js', 'utf8');
console.log(code.substring(0, 1500));
