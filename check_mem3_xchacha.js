const fs = require('fs');
const crypto = require('crypto');
// Node standard crypto doesn't support XChaCha20-Poly1305. We can try to use tweetnacl or libsodium-wrappers.
// Actually, let's just write a python script using cryptography!
