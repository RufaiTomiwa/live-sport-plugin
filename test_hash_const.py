import os

with open('lock.wasm', 'rb') as f:
    wasm = f.read()

# We can search for the hash constants.
# SHA-256 constants:
sha256_k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5
]

import struct
sha256_bytes = b''.join(struct.pack('<I', x) for x in sha256_k)
if sha256_bytes in wasm:
    print('SHA-256 constants found!')
else:
    print('No SHA-256.')

