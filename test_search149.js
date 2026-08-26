const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// Since we know the Wasm exports a function called __wbg_new_b5d9e2fb389fef91, let's do:
let m = content.match(/[A-Za-z0-9_]*__wbg_new_b5d9e2fb389fef91[A-Za-z0-9_:\(\){,\.]*/g);
console.log(m ? m[0] : "Not found!");
