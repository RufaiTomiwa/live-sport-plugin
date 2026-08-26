const fs = require('fs');
const code = fs.readFileSync('lock_patched.mjs', 'utf8');
const lines = code.split('\n');
const line = lines[9]; // 0-indexed for line 10
if (line) {
    console.log(line.substring(108969 - 100, 108969 + 100));
}
