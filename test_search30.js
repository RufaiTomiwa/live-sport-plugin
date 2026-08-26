const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x2\]/g;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');
console.log(arr[0x2]);
console.log(arr[0x1]);
console.log(arr[0x4]);
