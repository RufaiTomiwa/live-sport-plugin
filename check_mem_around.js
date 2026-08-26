const fs = require('fs');

if (fs.existsSync('memAroundCiphertext.bin')) {
    const mem = fs.readFileSync('memAroundCiphertext.bin');
    const ciphertext = fs.readFileSync('fetch_payload.bin').subarray(3);
    const ct16 = ciphertext.subarray(0, 16);
    
    console.log('Mem dump size:', mem.length);
    console.log('Ciphertext 16 found at:', mem.indexOf(ct16));
    console.log('Ciphertext full found at:', mem.indexOf(ciphertext));
    
    // If it's copied there, maybe the key is nearby! Let's print out the hex of this whole block.
    if (mem.indexOf(ct16) !== -1) {
        console.log('--- START MEM AROUND CIPHERTEXT ---');
        console.log(mem.toString('hex'));
    }
} else {
    console.log('File not found');
}
