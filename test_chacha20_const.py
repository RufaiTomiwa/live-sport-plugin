import os

with open('lock.wasm', 'rb') as f:
    wasm = f.read()

# ChaCha20 constants: "expand 32-byte k" is "expand 32-byte k" in ascii
import struct
print('expand 32-byte k' in str(wasm))

if b'expand 32-byte k' in wasm:
    print('ChaCha20 constants found exactly!')
else:
    print('String not found.')

