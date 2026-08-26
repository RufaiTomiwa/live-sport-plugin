# What if it is AES-GCM?
# AES-GCM uses a 12-byte nonce normally. 
# But if the goat header is 24 bytes... AES-GCM can take any length nonce, but 12 bytes is standard.
# What about XChaCha20 nonce? It's exactly 24 bytes!
# Wait... The goat header string is "NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ".
# This string is 32 characters long.
# If it is NOT base64 decoded, it is 32 bytes!
# A 32-byte value is PERFECT for a KEY!!!

import base64
import os
goat = "NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ"
key = goat.encode('utf8')
print('Key length:', len(key))

from Crypto.Cipher import ChaCha20

with open('run_cipher3.bin', 'rb') as f:
    cipher = f.read()
if len(cipher) == 179:
    cipher = cipher[3:]

with open('mem_at_write3.bin', 'rb') as f:
    mem = f.read()

# Let's brute-force the NONCE from memory, assuming the goat is the key!
found = False
for i in range(0, len(mem) - 24, 4):
    nonce = mem[i:i+24]
    try:
        cipher_obj = ChaCha20.new(key=key, nonce=nonce)
        dec = cipher_obj.decrypt(cipher)
        if b'm3u8' in dec:
            print(f'FOUND XCHACHA20 NONCE! {nonce.hex()} at offset {i}')
            found = True
            break
    except Exception as e:
        pass

for i in range(0, len(mem) - 12, 4):
    nonce = mem[i:i+12]
    try:
        cipher_obj = ChaCha20.new(key=key, nonce=nonce)
        dec = cipher_obj.decrypt(cipher)
        if b'm3u8' in dec:
            print(f'FOUND CHACHA20 NONCE! {nonce.hex()} at offset {i}')
            found = True
            break
    except Exception as e:
        pass

if not found:
    print('Not found with goat as key.')
