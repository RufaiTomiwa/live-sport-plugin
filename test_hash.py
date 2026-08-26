import hashlib

# Let's test standard hashes of the URL parts to see if it matches the key.
# But wait, we didn't find the key in memory because it's zeroized, AND we didn't find it in the exact memory dump.
# Why didn't we find it in the exact memory dump when we decrypted using JS chacha20/xchacha20?
# Maybe the ciphertext is NOT decrypted with XChaCha20 directly!
# Let's look at what NOSCRPS means.
# The goat header is NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ (Base64)
# In bytes:
# 34 e4 82 44 f4 8e 18 95 9b 6a dc 2b 98 59 2c 81 d2 5f a1 0b 4c 92 61 c9
# Length is 24 bytes.
# 24 bytes is EXACTLY the nonce size for XChaCha20.
# So XChaCha20 is almost certain!
# But PyNaCl 
acl.bindings.crypto_aead_xchacha20poly1305_ietf_decrypt failed.
# Why?
# Maybe the ciphertext includes an authentication tag, but PyNaCl expects it at the end? Yes, that's standard.
# Maybe the key derivation uses a salt?
