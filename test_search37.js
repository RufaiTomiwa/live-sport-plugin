const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const { execSync } = require('child_process');

try {
    execSync('node -c lock.js');
    console.log("lock.js is fine");
} catch(e) {
    console.log("lock.js is broken too!");
}
