// What if it's NOT ChaCha20?
// "expand 32-byte k" IS in the WASM!
// If it's ChaCha20, but not standard ChaCha20?
// Wait, the WASM strings showed:
// invalid key value:
// invalid wire type value:
// StreamCipherErrorResponseuVarintSixtyFourBitLengthDelimitedStartGroupEndGroupThirtyTwoBit
// xpand 32-byte k
// invalid tag value:
// invalid varintVec is sized conservatively
// This confirms it uses a StreamCipher (ChaCha20).
// And it also mentions 	ag value, meaning it's an AEAD cipher (Poly1305).
// And it mentions arint and LengthDelimited, which means the PAYLOAD is Protobuf (LengthDelimited, etc)!
// So it decrypts an AEAD ciphertext, and then parses it as Protobuf?
// NO!
// The M3U8 string isn't protobuf!
// Wait. What if the M3U8 string IS INSIDE a Protobuf wrapper AFTER decryption?
// Let's hook TextDecoder.decode and log exactly what bytes are being decoded into strings!

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('analytics')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  page.on('console', async msg => {
      console.log('BROWSER:', msg.text());
  });

  await page.addInitScript(() => {
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                console.log('DECODED M3U8!!!');
                console.log('Hex:', Array.from(u8).map(x => x.toString(16).padStart(2, '0')).join(''));
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
