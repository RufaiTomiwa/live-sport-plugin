const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// How did 8cCReK appear in the stack trace if it's not a function?
// Ah! If it's unction(...MNLhUC8){ inside an object, e.g. [tdEyx0(xwy5d8[0xc2])]:function(...)
// And 	dEyx0(xwy5d8[0xc2]) evaluates to "8cCReK" at runtime!
// So it is one of the exports or functions given to Wasm!
// WVINNi1 is the imports object given to WebAssembly.instantiate!
// It contains [tdEyx0(xwy5d8[...])]: function(...)
// Let's find the one that has instanceof.

let m = content.match(/instanceof/g);
console.log(m.length);

let lastIndex = 0;
while (true) {
    let index = content.indexOf('instanceof', lastIndex);
    if (index === -1) break;
    console.log(content.substring(index - 100, index + 100));
    console.log("-------------------");
    lastIndex = index + 1;
}

