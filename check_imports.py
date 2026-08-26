import os

with open('lock.wasm', 'rb') as f:
    wasm = f.read()

# Since we know ChaCha20 constants are there, it's definitely ChaCha20 or XChaCha20.
# The key isn't remaining in memory... meaning they derive it dynamically and zeroize it after!
# The key must be derived from something.
# We know they call Headers.prototype.get('goat') to get the nonce.
# What else do they call? Let's check 	est_playwright_wasm_all_imports.js logs!
# Wait, did we print the arguments to the imported functions?
