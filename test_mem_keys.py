import nacl.bindings
import base64
import sys
import os

if not os.path.exists('fetch_payload.bin'):
    sys.exit('No fetch_payload.bin')

payload = open('fetch_payload.bin', 'rb').read()
goat = open('goat_nonce.txt', 'r').read().strip()
mem = open('wasm_mem.bin', 'rb').read()

print('Payload len:', len(payload))
print('Goat:', goat)
print('Memory len:', len(mem))

nonce_xchacha = base64.b64decode(goat) if goat else b''
nonce_chacha = nonce_xchacha[:12] if nonce_xchacha else b''

# payload is usually 179 bytes, first 3 bytes are protobuf framing, leaving 176 bytes.
inner_payload = payload[3:]
ciphertext_and_tag = inner_payload

keys = set()
for i in range(len(mem) - 32 + 1):
    keys.add(mem[i:i+32])

print(f'Testing {len(keys)} unique 32-byte chunks from memory as keys...')

found = False
for k in keys:
    # try xchacha
    if nonce_xchacha:
        try:
            dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(
                ciphertext_and_tag, None, nonce_xchacha, k
            )
            print(f'FOUND XCHACHA KEY! {k.hex()} -> {dec}')
            found = True
            break
        except: pass

    # try chacha
    if nonce_chacha:
        try:
            dec = nacl.bindings.crypto_aead_chacha20poly1305_ietf_decrypt(
                ciphertext_and_tag, None, nonce_chacha, k
            )
            print(f'FOUND CHACHA KEY! {k.hex()} -> {dec}')
            found = True
            break
        except: pass

if not found:
    print('Key not found in memory dump either!')
