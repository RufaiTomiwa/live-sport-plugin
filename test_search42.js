const fs = require('fs');
const orig = fs.readFileSync('lock.js', 'utf-8');
const mod = fs.readFileSync('lock_mod5.js', 'utf-8');

for (let i = 0; i < orig.length; i++) {
    if (orig[i] !== mod[i]) {
        console.log("Difference at", i);
        console.log("Orig:", orig.substring(i - 20, i + 20));
        console.log("Mod:", mod.substring(i - 20, i + 20));
        break;
    }
}
