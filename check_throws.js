const fs = require('fs');
const code = fs.readFileSync('lock_patched3.mjs', 'utf8');

// The obfuscator throws empty strings using 	hrow "" or 	hrow'' or 	hrow""
const throwMatches = code.match(/throw[ \t]*['"][ \t]*['"]/g);
console.log('Throws:', throwMatches);

// What about throw with a variable that evaluates to empty string?
// like 	hrow X where X is ""
// We saw 	hrow PoVL2i. Are there other variables being thrown?
