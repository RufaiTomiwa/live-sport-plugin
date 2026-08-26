const fs = require('fs');
const crypto = require('crypto');

let cipher = fs.readFileSync('run_cipher3.bin');
if (cipher.length === 179) cipher = cipher.subarray(3);

const goatStr = 'NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ';
const key = Buffer.from(goatStr, 'utf8');

// The ciphertext is 176 bytes. 
// Standard AES-GCM or ChaCha20-Poly1305 has a 16 byte tag at the end. 
// So plaintext should be 160 bytes.
// But the decrypted URL is:
// "https://lb1.strmd.st/secure/aerxncRbMZKFsvFmjZfyxldtfznfuurG/rtmp/stream/247-tennis_720/1/playlist.m3u8"
// Length is EXACTLY 103 bytes! Wait.
// If plaintext is 103 bytes, why is ciphertext 176 bytes?!
// Could it be that the ciphertext INCLUDES the nonce?
// Let's check! 103 (plaintext) + 16 (tag) = 119. 
// 176 - 119 = 57 bytes. That doesn't match standard nonces (12 or 24).
// What if it's Protobuf encoded?
// Protobuf:
// message { string url = 1; }
// That would add maybe 2 bytes overhead. Still doesn't explain 176.

console.log('Plaintext length (assumed):', 103);
console.log('Ciphertext length:', cipher.length);
