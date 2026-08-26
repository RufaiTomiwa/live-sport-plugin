import nacl.bindings
import base64
import sys

payload = open('fetch_payload.bin', 'rb').read()
goat = open('goat_nonce.txt', 'r').read().strip()
mem = open('wasm_mem.bin', 'rb').read()

nonce_xchacha = base64.b64decode(goat) if goat else b''
nonce_chacha = nonce_xchacha[:12] if nonce_xchacha else b''

inner_payload = payload[3:]
ciphertext = inner_payload[:-16]
tag = inner_payload[-16:]

# Maybe it's NOT Poly1305? Maybe it's pure ChaCha20?
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms

keys = set()
for i in range(len(mem) - 32 + 1):
    keys.add(mem[i:i+32])

print(f'Testing {len(keys)} unique 32-byte chunks with pure ChaCha20...')

found = False
for k in keys:
    if nonce_chacha:
        try:
            cipher = Cipher(algorithms.ChaCha20(k, nonce_chacha), mode=None).decryptor()
            dec = cipher.update(inner_payload)
            if b'http' in dec or b'm3u8' in dec or b'lb' in dec:
                print(f'FOUND PURE CHACHA KEY! {k.hex()} -> {dec}')
                found = True
                break
        except: pass
        
        # Test with the raw payload including tag
        try:
            cipher = Cipher(algorithms.ChaCha20(k, nonce_chacha), mode=None).decryptor()
            dec = cipher.update(ciphertext)
            if b'http' in dec or b'm3u8' in dec or b'lb' in dec:
                print(f'FOUND PURE CHACHA KEY! (No tag) {k.hex()} -> {dec}')
                found = True
                break
        except: pass

if not found:
    print('Key not found using pure chacha20 either!')
