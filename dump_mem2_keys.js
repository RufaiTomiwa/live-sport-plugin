const fs = require('fs');

const mem = fs.readFileSync('wasm_mem_playwright_3.bin');

// M3U8 string from run 2: https://lb12.strmd.st/secure/iYpwveAXcXlvribuFEiCrtHRgHEEuQgJ/rtmp/stream/247-tennis_720/1/playlist.m3u8
// The key should be nearby, OR it could be in the beginning of memory, OR in a specific register!
// Let's dump all 32-byte chunks from run 2 memory.
let keys = new Set();
for (let i = 0; i <= mem.length - 32; i++) {
    keys.add(mem.subarray(i, i + 32).toString('hex'));
}
fs.writeFileSync('mem2_keys.txt', Array.from(keys).join('\n'));
console.log('Saved', keys.size, 'keys from memory 2');
