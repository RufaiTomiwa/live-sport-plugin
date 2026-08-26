const fs = require('fs');
const lock = fs.readFileSync('lock_patched.mjs', 'utf8');

const regex = /export function init_wasm\((.*?)\)/g;
let match;
while ((match = regex.exec(lock)) !== null) {
    console.log(match[0]);
    console.log(lock.substring(match.index, match.index + 200));
}
