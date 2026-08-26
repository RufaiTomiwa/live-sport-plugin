const fs = require('fs');
const code = fs.readFileSync('lock.js', 'utf8');
const match = code.match(/__wbg_fetch_[a-z0-9]+/g);
if (match) {
    const fnName = match[0];
    const idx = code.indexOf(fnName);
    console.log("Found", fnName);
    console.log(code.substring(idx - 50, idx + 200));
}
