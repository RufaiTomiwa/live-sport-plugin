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
            if (str.includes('admin-tennis-channel') || str.includes('m3u8')) {
                console.log('TextDecoder.decode OUT:', str);
                // Can we trace where this memory came from?
                // If it's a subarray of WASM memory, we can log the offset!
                if (window.wasmInstance && window.wasmInstance.exports.memory.buffer === u8.buffer) {
                    console.log('DECODED FROM WASM MEMORY OFFSET:', u8.byteOffset);
                    
                    // We can also check 32 bytes before this offset! Maybe the key is there!
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    if (u8.byteOffset >= 32) {
                        const before = mem.subarray(u8.byteOffset - 32, u8.byteOffset);
                        console.log('32 BYTES BEFORE DECODED STRING:', Buffer.from(before).toString('hex'));
                    }
                    if (u8.byteOffset >= 64) {
                        const before64 = mem.subarray(u8.byteOffset - 64, u8.byteOffset - 32);
                        console.log('64-32 BYTES BEFORE DECODED STRING:', Buffer.from(before64).toString('hex'));
                    }
                }
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
