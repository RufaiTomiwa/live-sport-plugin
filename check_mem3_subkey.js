const fs = require('fs');

const mem = fs.readFileSync('mem_at_write3.bin');
let cipher = fs.readFileSync('run_cipher3.bin');
if (cipher.length === 179) cipher = cipher.subarray(3);
    
const ptr = mem.indexOf(cipher);

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

const goat = Buffer.from('4e4f53435250534f474a5762617477726d466b7367644a666f51744d6b6d484a', 'hex').toString('utf8');
const nonce = Buffer.from(goat, 'base64');

const chachaNonce = Buffer.alloc(12);
nonce.copy(chachaNonce, 4, 16, 24);

console.log('Sub-nonce:', chachaNonce.toString('hex'));

let found = false;
for (let i = 0; i < mem.length - 32; i += 4) {
    const key = mem.subarray(i, i+32);
    const dec = chacha20(key, chachaNonce, cipher);
    if (dec && dec.toString('utf8').includes('m3u8')) {
        console.log('FOUND XCHACHA20 SUBKEY:', key.toString('hex'));
        console.log('Offset in mem:', i);
        found = true;
        break;
    }
}

if (!found) console.log('Subkey not found in memory.');

