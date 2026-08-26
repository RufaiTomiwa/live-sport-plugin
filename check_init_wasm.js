const fs = require('fs');
const lock = fs.readFileSync('lock_patched.mjs', 'utf8');

const idx = lock.indexOf('init_wasm');
if (idx !== -1) {
    console.log(lock.substring(Math.max(0, idx - 50), idx + 200));
}
