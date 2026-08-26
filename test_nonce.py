from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
import binascii

key = bytes.fromhex('d336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b')
val = bytes.fromhex('6b276e5c6664264d3048312f616c30616d6e6e58784769277d327c31706f6f28672a30636a317b5b7a677a2e4e222946264d246c59592b6b314a236649636d65587e65616f682868212d4b6c7e586f694e5e496c5b5f50264f5d286c60466933316778217c425a4d246f287a2a7a2e71302846297b4a666c7d2f66296258695c6d7159336c5e3061665f6b6b4b4c6166323133233029226d502c7c3379214c2421656f237c627a6d5b227d29645b6054')

nonce = val[:12]
ct = val[12:]

try:
    chacha = ChaCha20Poly1305(key)
    pt = chacha.decrypt(nonce, ct, None)
    print("Decrypted! First 12 bytes as Nonce:", pt)
except Exception as e:
    print("Failed first 12 bytes:", e)

# Try last 12 bytes as nonce
nonce = val[-12:]
ct = val[:-12]
try:
    chacha = ChaCha20Poly1305(key)
    pt = chacha.decrypt(nonce, ct, None)
    print("Decrypted! Last 12 bytes as Nonce:", pt)
except Exception as e:
    print("Failed last 12 bytes:", e)
