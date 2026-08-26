const fs = require('fs');
let html = fs.readFileSync('rally_embedindia.html', 'utf8');
console.log('Contains .wasm?', html.includes('.wasm'));
console.log('Contains WebAssembly?', html.includes('WebAssembly'));
