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
    // If the timer interval didn't trigger, it's because WASM execution is completely synchronous and blocks the event loop!
    // We can't interrupt it with a setInterval.
    // The only way to step into it is to find the exact offset in the WASM code and inject a breakpoint, OR modify the WASM to call a JS function right before/after decryption.
    // WAIT. We CAN modify the WASM! We have lock.wasm. We can write a custom loader.
    // But modifying WASM requires parsing it.
    // Is there any other way? 
    // What if the key is derived from the goat nonce? No, the goat is different for every request (it's the nonce).
    // What if the key is fixed and obfuscated?
    // How can we statically extract strings from the WASM?
    
    // Let's just run strings lock.wasm.
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(1000);
  
  await browser.close();
})();
