const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x2\]/g;
let m;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');
console.log(arr[1435], arr[1436], arr[1437], arr[1438], arr[1439], arr[1421]);
