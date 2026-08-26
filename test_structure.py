// 176 - 16 = 160.
// Is 160 a multiple of 16? Yes! (16 * 10 = 160).
// Wait, ChaCha20 is a stream cipher, so ciphertext length should exactly match plaintext length (+ auth tag).
// BUT AES-CBC requires padding to block size (16 bytes).
// Wait! If plaintext is 103 bytes, AES-CBC with PKCS7 padding would be 112 bytes.
// Why 160 bytes?
// Maybe the plaintext is exactly 160 bytes?
// Or maybe the decryption algorithm is NOT standard ChaCha20-Poly1305?
// Wait. We saw WASM strings:
// invalid key value:
// invalid wire type value:
// StreamCipherErrorResponseuVarintSixtyFourBitLengthDelimitedStartGroupEndGroupThirtyTwoBit
// 
// So the structure is:
// [Ciphertext] -> decrypted -> [Protobuf Message]
// The Protobuf message contains https://lb1.strmd.st/....
// The Protobuf message length must be 160 bytes.
// What else is in the protobuf message?

// Let's decode the ciphertext assuming we find the key in WASM.
// If it IS standard ChaCha20/XChaCha20, we can decompile WASM.

import os
with open('lock.wasm', 'rb') as f:
    wasm = f.read()
print('Decompiling WASM snippet...')
