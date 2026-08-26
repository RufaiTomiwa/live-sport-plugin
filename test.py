import nacl.bindings
import base64

# M3U8 string from run 2 was found in memory, meaning it WAS decrypted successfully.
# And we intercepted the GOAT header and payload from Playwright. But wait, we didn't save the payload from run 2!!!
# Let's run playwright again, grab the payload AND goat header AND memory dump, all from the SAME session.
