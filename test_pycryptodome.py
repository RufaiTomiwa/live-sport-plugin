import os

with open('mem_at_write3.bin', 'rb') as f:
    mem = f.read()

with open('run_cipher3.bin', 'rb') as f:
    cipher = f.read()

if len(cipher) == 179:
    cipher = cipher[3:]

import base64
goat_b64 = "NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ"
nonce = base64.b64decode(goat_b64)

# In PyCryptodome, ChaCha20 supports XChaCha20 if nonce is 24 bytes!
try:
    from Crypto.Cipher import ChaCha20
except:
    os.system('pip install pycryptodome')
    from Crypto.Cipher import ChaCha20

found = False
for i in range(0, len(mem) - 32, 4):
    key = mem[i:i+32]
    try:
        cipher_obj = ChaCha20.new(key=key, nonce=nonce)
        dec = cipher_obj.decrypt(cipher)
        if b'm3u8' in dec:
            print(f'FOUND XCHACHA20 KEY! {key.hex()} at offset {i}')
            found = True
            break
    except Exception as e:
        pass

if not found:
    print('Not XChaCha20 either.')
