const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x36\]/g;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');
console.log(arr[parseInt('0x36', 16)]); 
