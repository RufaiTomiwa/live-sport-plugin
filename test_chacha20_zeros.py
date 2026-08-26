import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms

key_hex = 'd336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b'
key = bytes.fromhex(key_hex)
payload = bytes.fromhex('29647c5b6b60614b69265e63604d6160497e7b5965482d662e3328704e6b67335923792364645d5e325f21286a785b502b6a6c66616e7b7a6e792949476258796d5f6f325c7b60782e5a6e256531492b63655b626a60622b6d7d6f68477d68646e5d672b7e5f624a6e427a335b4a70322d6e4d2e4f676e5a2c5f7e5e7e30322f5b4d59264f5829277d306f676c4d7e635c294b7d5d2e66707e70662a2e687133254f62684c5d7d2d6f7b674d626a2223')

nonce = b'\x00' * 16
algorithm = algorithms.ChaCha20(key, nonce)
cipher = Cipher(algorithm, mode=None)
decryptor = cipher.decryptor()
dec = decryptor.update(payload)

print(dec[:50])
