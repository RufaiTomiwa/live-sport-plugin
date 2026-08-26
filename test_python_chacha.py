from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

key = bytes.fromhex('d336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b')
nonce = bytes.fromhex('289434c0368a06b546181f39') # 12 bytes
# If it's pure chacha20, nonce in python must be 16 bytes? 
# Wait, cryptography expects 16 bytes for standard ChaCha20 algorithm.
# Let's pad nonce to 16 bytes with 0s at the start.
nonce_16 = b'\x00\x00\x00\x00' + nonce

ct = bytes.fromhex('6b276e5c6664264d3048312f616c30616d6e6e58784769277d327c31706f6f28672a30636a317b5b7a677a2e4e222946264d246c59592b6b314a236649636d65587e65616f682868212d4b6c7e586f694e5e496c5b5f50264f5d286c60466933316778217c425a4d246f287a2a7a2e71302846297b4a666c7d2f66296258695c6d7159336c5e3061665f6b6b4b4c6166323133233029226d502c7c3379214c2421656f237c627a6d5b227d29645b6054')

cipher = Cipher(algorithms.ChaCha20(key, nonce_16), mode=None, backend=default_backend())
decryptor = cipher.decryptor()
pt = decryptor.update(ct)

print(pt)
