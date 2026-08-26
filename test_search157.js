const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
// Ok, __wbg_new_b5d9e2fb389fef91 is normally 
ew Error(...) or 
ew Promise(...) or 
ew Headers(...) in wasm-bindgen!
// Wasm calls __wbg_new_b5d9e2fb389fef91 with args: [ 1048572, 1080192 ].
// What are these args?
// They are likely memory pointers! Pointers to strings!
