const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// set_stream_jw calls T59HXD("set_stream_jw" decoded).
// T59HXD returns iXYgipw=[x5lBJ_,jt3IoMo],new T59HXD... Wait, no, set_stream_jw returns that!
// Oh! set_stream_jw returns the result of T59HXD.
// Let's look at set_stream_jw again.
const regex = /export function set_stream_jw.*?\{.*?\}/s;
const m = content.match(regex);
console.log(m[0]);
