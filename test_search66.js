const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /xwy5d8\[0x2\]/g;
let m;
let arr = content.match(/const xwy5d8=\[(.*?)\]/s)[1].split(',');

// So when it crashes on 67CHo7, the arguments it evaluates are...
// Actually, earlier we printed:
// HITTING 67CHo7!
// EVALUATING: 1102 => arr[1102]
// EVALUATING: 469 => arr[469]
// EVALUATING: 472 => arr[472]
// EVALUATING: 473 => arr[473]

// But arr[1102] doesn't exist?
console.log(arr[1102]); // 0x430
console.log(arr[parseInt('0x430', 16)]); 
