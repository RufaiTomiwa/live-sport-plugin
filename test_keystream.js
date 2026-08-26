const fs = require('fs');

const mem1 = fs.readFileSync('wasm_mem.bin');

// I have one mem dump that definitely contains the M3U8.
// Since pure ChaCha20 decryption failed, perhaps the decryption is ChaCha20 but with a specific counter?
// ChaCha20 counter is usually 0 or 1. cryptography defaults to 0.

const inner = fs.readFileSync('fetch_payload.bin').subarray(3);
const m3u8Bytes = Buffer.from('playlist.m3u8');

// The ciphertext is inner minus tag if poly1305.
// Let's XOR the decrypted m3u8 string (we have it: https://lb9.strmd.st/secure/slHDNTCPVunXuu...)
// with the ciphertext to recover the keystream!
// Wait! If it's ChaCha20, Ciphertext XOR Keystream = Plaintext.
// Ciphertext XOR Plaintext = Keystream.
// Is the plaintext length EXACTLY the same as ciphertext length?
// Plaintext:
const decStr = "https://lb9.strmd.st/secure/slHDNTCPVunXuudwdKxEMusgvzcDvyty/rtmp/stream/247-tennis_720/1/playlist.m3u8";
const decBuf = Buffer.from(decStr);

// We need to find inner inside mem1? We already checked, it wasn't there.
// We can just XOR inner and decBuf!
// Wait, inner might have an initialization vector at the beginning (the goat nonce is from header).
// Wait, inner length is 176. decBuf length is 103!
// So what are the other bytes?
// Ah, the first byte of decBuf (https...) aligns with SOME byte of the ciphertext.
for (let offset = 0; offset <= inner.length - decBuf.length; offset++) {
    const keystream = Buffer.alloc(decBuf.length);
    for (let i = 0; i < decBuf.length; i++) {
        keystream[i] = inner[offset + i] ^ decBuf[i];
    }
    // console.log('Offset ' + offset + ' Keystream:', keystream.toString('hex'));
}
// Actually, if we have the keystream, can we reverse the key? No, ChaCha20 is secure.
// But we can check if it IS ChaCha20 keystream.
