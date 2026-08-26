const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(.*?\)\{return/s;
let m;
let lastIndex = 0;
while (true) {
    let index = content.indexOf('catch(', lastIndex);
    if (index === -1) break;
    let text = content.substring(index, index + 200);
    if (text.includes('instanceof')) {
        console.log(text);
        break;
    }
    lastIndex = index + 1;
}
