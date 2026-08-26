import nacl.bindings
import base64

key_hex = 'd336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b'
key = bytes.fromhex(key_hex)

goat = 'NOSCRPSMddQjzHctaajAbtEAWeULEDbK'
nonce = base64.b64decode(goat)

payload = bytes.fromhex('0ab00149644c32487b2e4b2a646160227d7c4b4e632762705a715970262e465a5d614b7d2b716b21224c6e4c472c71504a7d655833215a70497930237d795f5f5b6c592c78476a715d274b23227d6e7d692a33477e7e60642d6d302f672b257b65697a5a686c227d584c6f46294b2a336f2621506a786b32284b4266652b2b4a6e5d64662e33793350257b2268792b597b7d6558622347592a232e21597b4f5e312e24652c58464b305831792c6a6b6a334959')
ciphertext_and_tag = payload[3:]

try:
    dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(
        ciphertext_and_tag,
        None,
        nonce,
        key
    )
    print('DECRYPTED XCHACHA20:', dec)
except Exception as e:
    print('XChaCha20 failed with key d336...', e)

    # try with another key we found
    key2 = bytes.fromhex('254b59607d4417e9dffbc307138ae5c8' + '254b59607d4417e9dffbc307138ae5c8')
    try:
        dec = nacl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt(
            ciphertext_and_tag,
            None,
            nonce,
            key2
        )
        print('DECRYPTED XCHACHA20 with key2:', dec)
    except Exception as e2:
        print('XChaCha20 failed with key2', e2)

