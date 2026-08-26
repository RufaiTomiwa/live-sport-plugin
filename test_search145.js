const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// Find __wbg_new_b5d9e2fb389fef91 implementation
let idx = content.indexOf('__wbg_new_b5d9e2fb389fef91');
console.log(content.substring(idx, idx + 400));
