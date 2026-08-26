const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');
const regex = /export function set_stream_jw.*?\{.*?\}/s;
const m = content.match(regex);

const replaced = content.replace(m[0], m[0].replace('T59HXD(tdEyx0(xwy5d8[0x119]))', 'T59HXD(tdEyx0(xwy5d8[0x119])).catch(e => { console.log("INNER CATCH:", e); throw e; })'));
fs.writeFileSync('lock_mod.js', replaced);
