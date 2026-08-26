const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x538\]/g;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');
console.log(arr[parseInt('0x538', 16)]); // tdEyx0(xwy5d8[0x538]) -> WebAssembly
