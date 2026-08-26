const fs = require('fs');

if (!fs.existsSync('wasm_mem_playwright_2.bin')) {
    console.log('No memory dump yet!');
    process.exit(1);
}

const mem = fs.readFileSync('wasm_mem_playwright_2.bin');
const target = Buffer.from('playlist.m3u8');
const idx = mem.indexOf(target);
if (idx !== -1) {
    console.log('Found m3u8 at offset:', idx);
    const start = Math.max(0, idx - 150);
    const end = Math.min(mem.length, idx + 50);
    console.log('Context string:', mem.subarray(start, end).toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, '.'));
    console.log('Context hex:', mem.subarray(start, end).toString('hex'));
} else {
    console.log('m3u8 not found');
}
