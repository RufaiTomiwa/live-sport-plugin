const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x2\]/g;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');
// wait the index was 1421... the array length is 1417!!
console.log("length:", arr.length);
