const fs = require('fs');
let code = fs.readFileSync('src/providers/EmbedIndiaProvider.js', 'utf8');
let idx = code.indexOf('Client-side extraction fallback');
if (idx === -1) idx = code.indexOf('Tier 2:');
if (idx === -1) idx = code.indexOf('Tier 2');
console.log(code.substring(idx + 500, idx + 1500));
