import os

with open('mem_at_decode5.bin', 'rb') as f:
    mem = f.read()

with open('run_cipher5.bin', 'rb') as f:
    cipher = f.read()

if len(cipher) == 179:
    cipher = cipher[3:]

import base64
with open('goat5.txt', 'r') as f:
    goat_b64 = f.read().strip()

nonce = base64.b64decode(goat_b64)
goat_key = goat_b64.encode('utf8')

try:
    from Crypto.Cipher import ChaCha20
except:
    pass

import nacl.bindings

found = False
for i in range(0, len(mem) - 32, 4):
    key = mem[i:i+32]
    # Test XChaCha20-Poly1305 (PyNaCl)
    try:
        dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(cipher, None, nonce, key)
        if b'm3u8' in dec:
            print(f'FOUND XCHACHA KEY! {key.hex()} at offset {i}')
            found = True
            break
    except Exception as e:
        pass

if not found:
    # Test XChaCha20 (PyCryptodome)
    for i in range(0, len(mem) - 32, 4):
        key = mem[i:i+32]
        try:
            cipher_obj = ChaCha20.new(key=key, nonce=nonce)
            dec = cipher_obj.decrypt(cipher)
            if b'm3u8' in dec:
                print(f'FOUND CHACHA KEY! {key.hex()} at offset {i}')
                found = True
                break
        except Exception as e:
            pass

if not found:
    # Test goat as key, memory as nonce
    for i in range(0, len(mem) - 24, 4):
        nonce_mem = mem[i:i+24]
        try:
            dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(cipher, None, nonce_mem, goat_key)
            if b'm3u8' in dec:
                print(f'FOUND XCHACHA NONCE! {nonce_mem.hex()} at offset {i}')
                found = True
                break
        except Exception as e:
            pass

if not found:
    print('Key still not found in exact decode dump!')

