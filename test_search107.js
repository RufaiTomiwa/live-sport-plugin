const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8');

// I'll log tdEyx0(xwy5d8[0x546]) and xwy5d8[0x533].
// Wait, we can see in our decode logs:
// tdEyx0(xwy5d8[0x546]) -> Instan
// xwy5d8[0x533] -> ce
// So ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x546])+xwy5d8[0x533]] -> WebAssembly.Instance
// Wait, is it WebAssembly.Instance in the global environment?
// In our mocked environment:
// WebAssembly.Instance doesn't exist? Wait, Node has WebAssembly.Instance. 
// Wait, is ZJbr9VM("WebAssembly") equal to the global WebAssembly?
// ZJbr9VM(x) is globalThis[x]. 
// So ZJbr9VM("WebAssembly").Instance is WebAssembly.Instance. 
// But earlier it said: "Right-hand side of 'instanceof' is not an object"

console.log(content.indexOf('Ab63Qb0 instanceof'));
