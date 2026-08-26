const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

let lastIndex = 0;
while (true) {
    let index = content.indexOf('instanceof', lastIndex);
    if (index === -1) break;
    let text = content.substring(index - 50, index + 200);
    if (text.includes('?')) {
        console.log(text);
        console.log("---------------");
    }
    lastIndex = index + 1;
}
