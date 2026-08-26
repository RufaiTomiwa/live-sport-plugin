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
    // If the subkey is not found, what about hashing?
    // Let's hook ALL text decoder and encoder to see if any strings are hashed before the request!
    
    const origEncode = TextEncoder.prototype.encode;
    TextEncoder.prototype.encode = function(str) {
        console.log('TextEncoder encoding:', str);
        return origEncode.call(this, str);
    }
    
    // Also window.crypto.subtle?
    if (window.crypto && window.crypto.subtle) {
        const origDigest = window.crypto.subtle.digest;
        window.crypto.subtle.digest = function(algo, data) {
            console.log('Crypto.subtle.digest called with', algo);
            return origDigest.call(this, algo, data);
        }
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
