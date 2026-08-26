const fs = require('fs');
let content = fs.readFileSync('lock_mod12.js', 'utf-8'); // using mod12 which has decode logs

// We want to catch the exact error that causes the promise to reject.
// Wait, T59HXD is returning a promise? Yes!
// Let's modify set_stream_jw to catch that promise and log the error!
const regex = /export function set_stream_jw\(\.\.\.x5lBJ_\).*?return iXYgipw=\[x5lBJ_,jt3IoMo\],T59HXD\(tdEyx0\(xwy5d8\[0x119\]\)\)\}/s;
const m = content.match(regex);
const newStr = m[0].replace('T59HXD(tdEyx0(xwy5d8[0x119]))', 'T59HXD(tdEyx0(xwy5d8[0x119])).catch(e => { console.log("INNER SET_STREAM ERROR:", e); throw e; })');
content = content.replace(m[0], newStr);
fs.writeFileSync('lock_mod14.js', content);
