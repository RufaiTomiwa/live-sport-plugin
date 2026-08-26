const fs = require('fs');

if (fs.existsSync('mem_at_write2.bin')) {
    const mem = fs.readFileSync('mem_at_write2.bin');
    const cipher = fs.readFileSync('run_cipher2.bin');
    console.log('Cipher found in memWrite2?', mem.indexOf(cipher));
    
    // what about mem_at_decode2?
    const memDec = fs.readFileSync('mem_at_decode2.bin');
    console.log('Cipher found in memDecode2?', memDec.indexOf(cipher));
} else {
    console.log('NO FILE');
}
