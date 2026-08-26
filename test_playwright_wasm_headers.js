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
    // If the ciphertext and nonce aren't found in memory, they might be copied and immediately XORed/decrypted in registers, 
    // or the WASM engine doesn't keep them in memory for long.
    
    // BUT what about the fetch headers? The WASM lock.wasm needs to READ the goat header to get the nonce!
    // How does WASM read headers in Rust (web-sys)?
    // It calls Headers.get() !
    // Let's hook Headers.prototype.get and see what arguments it passes.
    
    const origGet = Headers.prototype.get;
    Headers.prototype.get = function(name) {
        if (name === 'goat') {
            console.log('HEADERS.GET("goat") CALLED!');
            // Print a stack trace to see what called it? In WASM we won't see much, just wasm-function[N].
            console.log(new Error().stack);
        }
        return origGet.apply(this, arguments);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
