const fs = require('fs');
let lock = fs.readFileSync('lock.mjs', 'utf8');

// Replace the init logic to use fs
lock = lock.replace(
    "if (typeof input === 'undefined') {",
    "if (typeof input === 'undefined') { input = require('fs').readFileSync('lock.wasm');"
);

fs.writeFileSync('lock_patched.mjs', lock);
console.log('Patched lock.mjs to lock_patched.mjs');
