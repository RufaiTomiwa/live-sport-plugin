const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x119\]/g;
let m;
while ((m = regex.exec(content)) !== null) {
    console.log(m.index);
}

// Find xwy5d8 definitions
const arrMatch = content.match(/const xwy5d8=\[(.*?)\]/s);
if (arrMatch) {
    const arr = arrMatch[1].split(',');
    console.log("xwy5d8[0x119] =", arr[0x119]);
}
