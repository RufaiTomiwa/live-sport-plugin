import os

with open('mem_at_decode.bin', 'rb') as f:
    mem = f.read()

# Did it find it in the new mem_at_decode.bin?
# Let's search memory again!
# But wait, run_cipher3.bin doesn't correspond to this run!
# We need to run the full script that extracts cipher AND memory AND goat at the same time!
