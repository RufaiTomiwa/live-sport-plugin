const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x2\]/g;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');
console.log(arr[1102]);
console.log(arr[469]);
console.log(arr[472]);
console.log(arr[473]);
