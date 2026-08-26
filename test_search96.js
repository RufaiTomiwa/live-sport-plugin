const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /catch\(.*?\)\{.*?instanceof.*?\}/s;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(match[0].substring(0, 100));
    content = content.substring(match.index + 10); // break infinite loop maybe, or just do matchAll
    break;
}
