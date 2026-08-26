const fs = require('fs');

const mem = fs.readFileSync('mem_at_write3.bin');
let cipher = fs.readFileSync('run_cipher3.bin');

// Wait! If they are NOT using Poly1305, they don't have an auth tag!
// It's just ChaCha20 or XChaCha20.
// Let's implement XChaCha20 (without Poly1305) in Javascript and test EVERY 32-byte chunk as a key!

const crypto = require('crypto');

function hchacha20(key, nonce16) {
    // HChaCha20 uses the ChaCha20 core function.
    // In Node.js, we don't have HChaCha20.
    // BUT we have python cryptography... No wait, we need the raw HChaCha20.
    // Actually, XChaCha20 is standard.
}

