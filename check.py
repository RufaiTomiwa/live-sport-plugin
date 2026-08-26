import os

with open('lock.wasm', 'rb') as f:
    wasm = f.read()

# Let's check for SipHash constants. 
# siphash is often used in Rust HashMaps!
# Wait, if they use the ChaCha20 key derived from something, what if it's derived using PBKDF2, Argon2, Scrypt?
# Wait, PyNaCl uses XSalsa20, XChaCha20Poly1305.

# Let's print out the exact string we got from 
acl.bindings earlier.
# The error was SyntaxError in python earlier, but before that, dir(nacl.bindings) showed:
# 'crypto_aead_xchacha20poly1305_ietf_decrypt'

# Let's re-try brute-forcing the key using crypto_aead_xchacha20poly1305_ietf_decrypt, but WITHOUT the first 3 bytes (the protobuf tag) from un_cipher3.bin. 
# Wait, we DID strip the first 3 bytes!
# if len(cipher) == 179: cipher = cipher[3:]
# We brute forced memory and didn't find the XChaCha key.

# What if the key is just the goat nonce? No, the key must be 32 bytes.
# What if it's NOT XChaCha20-Poly1305, but XChaCha20 WITHOUT Poly1305?
# "expand 32-byte k" is the ChaCha20 constant.
