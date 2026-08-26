const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

let m = content.match(/function[^{]*\{[^}]*__wbg_new_b5d9e2fb389fef91[\s\S]*?__wbindgen_string_get/);
console.log(m ? "Found!" : "Not found!");
