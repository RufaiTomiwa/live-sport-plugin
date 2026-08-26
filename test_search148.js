const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// The function __wbg_new_b5d9e2fb389fef91 is in lock.js
let idx = content.indexOf('__wbg_new_b5d9e2fb389fef91');
console.log(content.substring(idx - 100, idx + 200));

