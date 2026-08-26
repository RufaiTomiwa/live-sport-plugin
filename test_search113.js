const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(PoVL2i\)\{.*?instanceof.*?\}/g;
let lastIndex = 0;
while (true) {
    let index = content.indexOf('catch(PoVL2i){return PoVL2i instanceof', lastIndex);
    if (index === -1) break;
    let text = content.substring(index, index + 300);
    console.log(text);
    lastIndex = index + 1;
}
