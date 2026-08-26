import json
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305

key_hex = 'd336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b'
key = bytes.fromhex(key_hex)

# Load the payload we saved earlier
with open('fetch_response.bin', 'rb') as f:
    data = f.read()

# Protobuf parsing:
# First byte is 0x0a (tag 1, wire type 2)
# Second byte is 0xac, third is 0x01. (0xac & 0x7f) | (0x01 << 7) = 0x2c | 0x80 = 44 + 128 = 172.
# Payload starts at index 3.
payload = data[3:]

if len(payload) == 172:
    nonce = payload[:12]
    ciphertext = payload[12:156]
    tag = payload[156:]
    
    # In cryptography library, ChaCha20Poly1305 takes nonce and ciphertext + tag combined
    cip = ChaCha20Poly1305(key)
    try:
        dec = cip.decrypt(nonce, ciphertext + tag, None)
        print('DECRYPTED!', dec)
    except Exception as e:
        print('Failed 1:', e)
        
    # Try different offsets just in case
    # Maybe ciphertext + tag is just the rest
    try:
        dec = cip.decrypt(nonce, payload[12:], None)
        print('DECRYPTED 2!', dec)
    except Exception as e:
        pass
else:
    print('Payload length is not 172:', len(payload))
