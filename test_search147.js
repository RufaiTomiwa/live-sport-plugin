const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
// The module name was "./locked_bg.js". 
// So the imports object is being constructed dynamically using 	dEyx0(...).
// We saw earlier: tdEyx0(0x...) returned "__wbg_new_b5d9e2fb389fef91".
// But in 	est_proxy_lock.mjs, when we print the function call:
// __wbg_new_b5d9e2fb389fef91 was called with [ 1048572, 1080192 ]
// and returned Promise rejected in Wasm import: ./locked_bg.js __wbg_new_b5d9e2fb389fef91
// So it returned a Promise!
// What built-in object returns a Promise from a 
ew call? 
// No built-in returns a Promise from 
ew.
// Wait, __wbg_new_ in wasm-bindgen usually means 
ew Something().
// 5d9e2fb389fef91 is the hash. Let's see what it wraps.
