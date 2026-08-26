const fs = require('fs');

if (fs.existsSync('wasm_mem_before_m3u8.bin')) {
    const mem = fs.readFileSync('wasm_mem_before_m3u8.bin');
    const inner = fs.readFileSync('fetch_payload.bin').subarray(3);
    
    // the fetch payload is ciphertext
    // Let's search if the ciphertext is in this 2048 block!
    const idx = mem.indexOf(inner);
    console.log('Ciphertext found at offset:', idx);
    
    if (idx !== -1) {
        // the ciphertext is there!
        // Where is the key?
        console.log('We found the ciphertext buffer inside WASM memory.');
    } else {
        // search for a smaller chunk
        const chunk = inner.subarray(0, 32);
        const idx2 = mem.indexOf(chunk);
        console.log('Ciphertext 32-byte chunk found at offset:', idx2);
    }
}
