const fs = require('fs');
if (!fs.existsSync('run_mem.bin')) process.exit(1);

const mem = fs.readFileSync('run_mem.bin');
let cipher = fs.readFileSync('run_cipher.bin');
if (cipher.length === 179) cipher = cipher.subarray(3); // strip pb tag
const m3u8 = fs.readFileSync('run_m3u8.txt', 'utf8');
const goat = fs.readFileSync('run_goat.txt', 'utf8').trim();

const nonce = Buffer.from(goat, 'base64');
console.log('Nonce:', nonce.toString('hex'));

const cipherIdx = mem.indexOf(cipher);
console.log('Cipher found at:', cipherIdx);

const m3u8Idx = mem.indexOf(Buffer.from(m3u8));
console.log('M3U8 found at:', m3u8Idx);

// Since we have the exact ciphertext and memory AT THE TIME OF DECRYPTION,
// we can search for the ChaCha20 key!
// The key is 32 bytes.
// We can use crypto to test each 32-byte chunk.
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

// XChaCha20 needs pynacl, but let's test regular ChaCha20 with 12 byte nonce first
const nonce12 = nonce.subarray(0, 12);
let found = false;
for (let i = 0; i < mem.length - 32; i += 4) {
    const key = mem.subarray(i, i+32);
    const dec = chacha20(key, nonce12, cipher);
    if (dec && dec.toString('utf8').includes('m3u8')) {
        console.log('FOUND KEY:', key.toString('hex'));
        found = true;
        break;
    }
}

if (!found) console.log('Key not found with ChaCha20-Poly1305 in JS.');

