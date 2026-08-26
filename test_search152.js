const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// It's in the JS code as an export or something. Object.asBDA9.
let m = content.match(/[A-Za-z0-9_]*asBDA9[A-Za-z0-9_:\(\){,\.]*/g);
console.log(m);

let m2 = content.match(/asBDA9/g);
console.log(m2.length);
