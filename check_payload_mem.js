const fs = require('fs');

const mem = fs.readFileSync('wasm_mem.bin');

// In WASM memory, there's usually a shadow stack.
// Let's dump all memory blocks that look like strings near the m3u8.
const m3u8Offset = 1115378;

// Also, the payload itself might be in memory!
const payload = fs.readFileSync('fetch_payload.bin');
const inner = payload.subarray(3);
const payloadIdx = mem.indexOf(inner);
if (payloadIdx !== -1) {
    console.log('Found payload in memory at:', payloadIdx);
} else {
    // try to find first 16 bytes of payload
    const first16 = inner.subarray(0, 16);
    const first16Idx = mem.indexOf(first16);
    console.log('Found first 16 bytes of payload at:', first16Idx);
}
