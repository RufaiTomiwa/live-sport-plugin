const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// We will just patch WebAssembly.instantiate to hook the memory!
let replaced = content.replace(
    'return await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](WVINNi1,jt3IoMo)',
    'let w = await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](WVINNi1,jt3IoMo); global.myWasmInstance = w; return w;'
);
replaced = replaced.replace(
    'const Ab63Qb0=await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](x5lBJ_,jt3IoMo);',
    'const Ab63Qb0=await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](x5lBJ_,jt3IoMo); global.myWasmInstance = Ab63Qb0;'
);

fs.writeFileSync('lock_mod21.js', replaced);
console.log("Hooked instance!");
