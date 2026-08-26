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
    // If init_wasm crashes, we can't easily run it outside Playwright unless we mock EVERYTHING!
    // But we CAN modify the WASM BEFORE it gets instantiated in Playwright!
    // Or we can just read the memory right after fetch resolves in Playwright.
    // What if we hook the exact WASM instruction that calls crypto_aead_xchacha20poly1305_ietf_decrypt?
    // How can we find the key?
    // The key is 32 bytes long. The nonce is 24 bytes long.
    // What if we dump the ENTIRE WASM memory BEFORE decryption, and AFTER decryption?
    // Wait, the memory dump mem_at_write3.bin is EXACTLY the memory right when the ciphertext is written to WASM.
    // At that moment, is the key in memory?
    // The key MUST be in memory because WASM doesn't call JS to decrypt!
    
    // So the key IS in mem_at_write3.bin!
    // But our Python and Node scripts failed to find it.
    // Why did they fail?
    // 1. We assumed the key is exactly one of the 32-byte chunks at 4-byte aligned boundaries. (It might not be 4-byte aligned!)
    // 2. We assumed the ciphertext is decrypted with XChaCha20-Poly1305. 
    //    Wait! What if the ciphertext in memory DOES NOT INCLUDE the 16-byte Poly1305 tag?
    //    What if the tag is stored SEPARATELY in memory, or stripped by the JS glue? No, it's 176 bytes, which means 160 bytes plaintext + 16 bytes tag.
    // 3. What if the decryption is NOT XChaCha20 but ChaCha20 with a 12-byte nonce?
    //    We tested that too!
    
    // Wait. "NOSCRPSOGJWbatwrmFksgdJfoQtMkmHJ" (32 bytes).
    // What if the KEY is a SHA-256 hash of this string?
    // What if the KEY is an MD5 hash?
    // Let's hook the WASM execution in Playwright and dump memory when it's DECODING the M3U8 string!
    // AT THAT EXACT MOMENT, we can dump the memory!
    
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                console.log('M3U8 string found! Taking memory dump of WASM memory NOW!');
                if (window.wasmInstance) {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.finalMemDump = Array.from(mem);
                }
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  const dump = await page.evaluate(() => window.finalMemDump);
  if (dump) {
      fs.writeFileSync('mem_at_decode.bin', Buffer.from(dump));
      console.log('Saved mem_at_decode.bin (len ' + dump.length + ')');
  }

  await browser.close();
})();
