const fs = require('fs');

const goat = fs.readFileSync('goat_nonce.txt', 'utf8').trim();
const goatBuf = Buffer.from(goat, 'base64');

const mem = fs.readFileSync('wasm_mem.bin');
let idx = mem.indexOf(goatBuf);
if (idx !== -1) {
    console.log('Found goat base64 decoded buffer in memory at:', idx);
} else {
    // try to find the goat string itself
    idx = mem.indexOf(Buffer.from(goat));
    console.log('Found goat string in memory at:', idx);
}
