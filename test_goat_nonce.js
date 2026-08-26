// The decrypted text is JUST the URL!
// Let's decode the hex:
const hex1 = '68747470733a2f2f6c62312e7374726d642e73742f7365637572652f616572786e6352624d5a4b467376466d6a5a6679786c6474667a6e66757572472f72746d702f73747265616d2f3234372d74656e6e69735f3732302f312f706c61796c6973742e6d337538';
console.log(Buffer.from(hex1, 'hex').toString());
// This outputs: https://lb1.strmd.st/secure/aerxncRbMZKFsvFmjZfyxldtfznfuurG/rtmp/stream/247-tennis_720/1/playlist.m3u8

// If the decryption is done via a static method (without passing the key from JS), where DOES the key come from?
// Either it's hardcoded in WASM... Or it's derived from goat AND the domain?
// The Goat header string is EXACTLY 32 bytes! "NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ"
// Wait. A ChaCha20 key is 32 bytes.
// What if NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ IS the key, but the nonce is DIFFERENT?
// Earlier we tried brute-forcing memory for the NONCE using Goat as the key! We tried both 12-byte and 24-byte nonces from memory, and found nothing.
// BUT what if the nonce is NOT in memory? What if the nonce is just [0]*12 or [0]*24?
