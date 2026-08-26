const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(PoVL2i\)\{.*?instanceof.*?\}/g;
let lastIndex = 0;
while (true) {
    let index = content.indexOf('catch(PoVL2i){', lastIndex);
    if (index === -1) break;
    let text = content.substring(index, index + 300);
    if (text.includes('instanceof')) {
        console.log(text);
        break;
    }
    lastIndex = index + 1;
}
