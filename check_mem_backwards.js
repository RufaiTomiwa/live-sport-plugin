const fs = require('fs');

const mem = fs.readFileSync('wasm_mem.bin');
const m3u8Str = 'playlist.m3u8';
const m3u8Offset = mem.indexOf(Buffer.from(m3u8Str));

if (m3u8Offset !== -1) {
    console.log('m3u8 found at:', m3u8Offset);
    // Let's trace backwards from m3u8Offset to find any 32-byte looking keys
    // The key must have been generated or passed dynamically!
    // Let's dump all memory that changed compared to a pristine run.
}
