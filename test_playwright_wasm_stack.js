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
    // Check if the fetch body was constructed via Protobuf directly in JS or WASM
    // Since we know the memory pointer for write was 1115384, but we couldn't find the payload there...
    // Is it possible the WASM uses etch internally but we hook etch and we don't see it?
    // Oh! The JS calls etch and then passes the result to WASM!
    
    const origGet = Headers.prototype.get;
    Headers.prototype.get = function(name) {
        if (name === 'goat') {
            console.log('Reading goat header! Stack: ' + new Error().stack);
        }
        return origGet.call(this, name);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
