const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// If asBDA9 is not found by match(/asBDA9/g), then how did I see Object.asBDA9 in the stack trace?
// Oh! Wait! 	dEyx0(xwy5d8[0x162]) is sBDA9 dynamically evaluated!!
// const Ab63Qb0=await ZJbr9VM(tdEyx0(xwy5d8[0x538]))[tdEyx0(xwy5d8[0x545])](x5lBJ_,jt3IoMo)
// x5lBJ_ was the string sBDA9.
// ZJbr9VM(tdEyx0(0x538)) evaluates to WebAssembly.
// tdEyx0(0x545) evaluates to instantiate.
// wait, so x5lBJ_ is the FIRST argument to WebAssembly.instantiate! It is NOT a buffer! It is the string sBDA9!
// Wait! WebAssembly.instantiate(buffer, imports) expects a buffer.
// If it was called with sBDA9, that's why uffer.length was undefined! And Wasm threw because the argument is invalid (string instead of buffer/Response).
// Why was T59HXD called with sBDA9?
// In set_stream_jw: T59HXD(tdEyx0(xwy5d8[0x119]))
// Which means set_stream_jw passes sBDA9 to T59HXD instead of a wasm module buffer!!
