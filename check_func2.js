const fs = require('fs');
const code = fs.readFileSync('lock_patched.mjs', 'utf8');
const idx = code.indexOf('5UZp3L');
if (idx !== -1) {
    console.log(code.substring(Math.max(0, idx - 50), idx + 300));
}
