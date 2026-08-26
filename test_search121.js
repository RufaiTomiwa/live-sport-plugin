const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x36\]/g;
let m;
let text = "";
while ((m = regex.exec(content)) !== null) {
    text += content.substring(m.index - 50, m.index + 50) + "\n";
}
console.log(text);
