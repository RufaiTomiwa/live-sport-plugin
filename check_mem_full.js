const fs = require('fs');

const mem = fs.readFileSync('wasm_mem.bin');
const target = Buffer.from('playlist.m3u8');
const idx = mem.indexOf(target);

if (idx !== -1) {
    console.log('M3U8 found at offset:', idx);
    const start = Math.max(0, idx - 64);
    const end = Math.min(mem.length, idx + 64);
    console.log('Context String:', mem.subarray(start, end).toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, '.'));
    console.log('Context Hex:', mem.subarray(start, end).toString('hex'));
} else {
    console.log('M3U8 not found in memory dump! This means the decryption did NOT happen or was GCed before we dumped memory!');
}
