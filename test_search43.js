const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const orig = 'function T59HXD(MNLhUC8,PoVL2i,t5Y3z3p,WVINNi1=';
const match = content.indexOf(orig);
const endBrace = content.indexOf('{', match + orig.length);
// wait, WVINNi1={...} is a default parameter! It spans multiple lines or has many properties!
// let's find the closing brace of the default parameter.
let openBraces = 1;
let curr = endBrace + 1;
while (openBraces > 0 && curr < content.length) {
    if (content[curr] === '{') openBraces++;
    else if (content[curr] === '}') openBraces--;
    curr++;
}
// curr is now after the closing brace of the default parameter.
// Now we look for the opening brace of the function body.
const bodyStart = content.indexOf('{', curr);
if (bodyStart !== -1) {
    content = content.substring(0, bodyStart + 1) + 'console.log("T59HXD START", MNLhUC8); ' + content.substring(bodyStart + 1);
}

fs.writeFileSync('lock_mod6.js', content);
