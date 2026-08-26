const fs = require('fs');
const mem = fs.readFileSync('mem_at_write3.bin');
let cipher = fs.readFileSync('run_cipher3.bin');
if (cipher.length === 179) cipher = cipher.subarray(3);
    
const ptr = mem.indexOf(cipher);

// Check if we can find the ChaCha20 key!
const crypto = require('crypto');
function chacha20(key, nonce, ciphertext) {
    try {
        const decipher = crypto.createDecipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
        decipher.setAuthTag(ciphertext.subarray(ciphertext.length - 16));
        let decrypted = decipher.update(ciphertext.subarray(0, ciphertext.length - 16));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    } catch (e) {
        return null;
    }
}

// We need the goat header for this run. We didn't save it in this run...
// Wait, we can extract it from the memory dump! 
// "4e4f53435250534f474a5762617477726d466b7367644a666f51744d6b6d484a"
// Look at the 128 bytes before!
// 4e4f53435250534f474a5762617477726d466b7367644a666f51744d6b6d484a = NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ (Base64)
const goat = Buffer.from('4e4f53435250534f474a5762617477726d466b7367644a666f51744d6b6d484a', 'hex').toString('utf8');
const nonce = Buffer.from(goat, 'base64');
console.log('Nonce:', nonce.toString('hex'));

const nonce12 = nonce.subarray(0, 12);
let found = false;
for (let i = 0; i < mem.length - 32; i += 4) {
    const key = mem.subarray(i, i+32);
    const dec = chacha20(key, nonce12, cipher);
    if (dec && dec.toString('utf8').includes('m3u8')) {
        console.log('FOUND KEY:', key.toString('hex'));
        console.log('Offset in mem:', i);
        found = true;
        break;
    }
}

if (!found) console.log('Key not found with ChaCha20-Poly1305 in JS.');

// Let's also check XChaCha20. Wait, XChaCha20 needs 24 byte nonce.
// crypto.createDecipheriv does NOT support XChaCha20 out of the box in standard Node crypto (only chacha20-poly1305 with 12 bytes).
