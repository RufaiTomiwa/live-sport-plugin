const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
const t5Match = content.match(/function 8cCReK.*?\{.*?\}/s);
if (t5Match) {
    console.log(t5Match[0].substring(0, 500));
} else {
    console.log("Not found 8cCReK");
}
