const fs = require('fs');

if (fs.existsSync('mem_at_write3.bin')) {
    const mem = fs.readFileSync('mem_at_write3.bin');
    let cipher = fs.readFileSync('run_cipher3.bin');
    if (cipher.length === 179) cipher = cipher.subarray(3);
    
    console.log('Cipher length:', cipher.length);
    console.log('Cipher found in memWrite3?', mem.indexOf(cipher));
    
    // what about mem_at_decode3?
    const memDec = fs.readFileSync('mem_at_decode3.bin');
    console.log('Cipher found in memDecode3?', memDec.indexOf(cipher));
    
    if (mem.indexOf(cipher) !== -1) {
        console.log('YES! Found it exactly at', mem.indexOf(cipher));
        
        // Let's dump 128 bytes before it in memWrite3, maybe the key is there!
        const ptr = mem.indexOf(cipher);
        const before = mem.subarray(ptr - 128, ptr);
        console.log('128 bytes before ciphertext:', before.toString('hex'));
    }
} else {
    console.log('NO FILE');
}
