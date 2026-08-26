import nacl.bindings
import base64
import sys

goat = 'NOSCRPSMddQjzHctaajAbtEAWeULEDbK'
nonce_xchacha = base64.b64decode(goat)
nonce_chacha = nonce_xchacha[:12]

payload = bytes.fromhex('0ab00149644c32487b2e4b2a646160227d7c4b4e632762705a715970262e465a5d614b7d2b716b21224c6e4c472c71504a7d655833215a70497930237d795f5f5b6c592c78476a715d274b23227d6e7d692a33477e7e60642d6d302f672b257b65697a5a686c227d584c6f46294b2a336f2621506a786b32284b4266652b2b4a6e5d64662e33793350257b2268792b597b7d6558622347592a232e21597b4f5e312e24652c58464b305831792c6a6b6a334959')
ciphertext_and_tag = payload[3:]

with open('all_keys.txt', 'r') as f:
    keys = f.read().splitlines()

print(f'Testing {len(keys)} keys...')

found = False
for k in keys:
    key_bytes = bytes.fromhex(k)
    
    # Try XChaCha20-Poly1305
    try:
        dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(
            ciphertext_and_tag, None, nonce_xchacha, key_bytes
        )
        print(f'FOUND XCHACHA KEY! {k} -> {dec}')
        found = True
        break
    except: pass

    # Try ChaCha20-Poly1305
    try:
        dec = nacl.bindings.crypto_aead_chacha20poly1305_ietf_decrypt(
            ciphertext_and_tag, None, nonce_chacha, key_bytes
        )
        print(f'FOUND CHACHA KEY! {k} -> {dec}')
        found = True
        break
    except: pass
    
    # Try ChaCha20 with nonce inside payload
    nonce_payload = payload[3:15]
    ciphertext_and_tag_payload = payload[15:]
    try:
        dec = nacl.bindings.crypto_aead_chacha20poly1305_ietf_decrypt(
            ciphertext_and_tag_payload, None, nonce_payload, key_bytes
        )
        print(f'FOUND CHACHA KEY (PAYLOAD NONCE)! {k} -> {dec}')
        found = True
        break
    except: pass

if not found:
    print('No key found in all_keys.txt')
