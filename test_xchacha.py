import os
import sys

with open('mem_at_write3.bin', 'rb') as f:
    mem = f.read()

with open('run_cipher3.bin', 'rb') as f:
    cipher = f.read()

if len(cipher) == 179:
    cipher = cipher[3:]

import base64
goat_b64 = "NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ"
nonce = base64.b64decode(goat_b64)
print("Nonce:", nonce.hex())

try:
    from chacha20poly1305 import ChaCha20Poly1305
except:
    pass

try:
    import nacl.secret
    import nacl.utils
    print('PyNaCl found!')
except:
    print('PyNaCl not found, attempting pip install PyNaCl')
    os.system('pip install PyNaCl')
    import nacl.secret
    import nacl.utils

# In PyNaCl, SecretBox uses XSalsa20-Poly1305.
# Wait, XChaCha20 is not XSalsa20. 
# libsodium does support xchacha20-poly1305 since a long time via crypto_aead_xchacha20poly1305_ietf.

import nacl.bindings
print(dir(nacl.bindings))

found = False
for i in range(0, len(mem) - 32, 4):
    key = mem[i:i+32]
    try:
        # libsodium xchacha20poly1305 ietf decrypt
        dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(cipher, None, nonce, key)
        if b'm3u8' in dec:
            print(f'FOUND KEY XCHACHA20! {key.hex()} at offset {i}')
            found = True
            break
    except Exception as e:
        pass

if not found:
    print('Key not found using XChaCha20-Poly1305.')

