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
    // wait, what if we overwrite the goat header and check if the decrypted M3U8 string changes!
    // No, if we overwrite the goat header to an invalid one, decryption will FAIL and we'll get garbage or throw!
    // If it fails, that PROVES it uses the goat header for decryption!
    
    const origGet = Headers.prototype.get;
    Headers.prototype.get = function(name) {
        if (name === 'goat') {
            console.log('Faking goat header!');
            return 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // invalid 24 byte base64
        }
        return origGet.call(this, name);
    }
    
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            console.log('TextDecoder called, length:', u8.length);
            if (u8.length > 50 && u8.length < 200) {
                 console.log('String?', str);
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
