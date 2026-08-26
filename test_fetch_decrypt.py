import urllib.request
import json
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305

req = urllib.request.Request(
    'https://embed.st/fetch',
    data=b'https://embed.st/embed/admin/admin-tennis-channel/1',
    headers={'Referer': 'https://streamed.pk/'}
)

with urllib.request.urlopen(req) as response:
    data = response.read()

print(f"Data length: {len(data)}")

key_hex = 'd336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b'
key = bytes.fromhex(key_hex)

payload = data[3:]
print(f"Payload length: {len(payload)}")

if len(payload) >= 28:
    nonce = payload[:12]
    cip = ChaCha20Poly1305(key)
    try:
        dec = cip.decrypt(nonce, payload[12:], None)
        print('DECRYPTED!', dec)
    except Exception as e:
        print('Failed 1:', e)
        
    # Maybe nonce is at the END?
    nonce2 = payload[-12:]
    try:
        dec = cip.decrypt(nonce2, payload[:-12], None)
        print('DECRYPTED 2!', dec)
    except Exception as e:
        print('Failed 2:', e)
