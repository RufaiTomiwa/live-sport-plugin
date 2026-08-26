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
    // Intercept crypto.subtle entirely and fake it?
    // Wait, let's just intercept Uint8Array constructor!
    const origUint8Array = Uint8Array;
    window.Uint8Array = function(...args) {
        if (args.length === 1 && typeof args[0] === 'number' && args[0] === 32) {
            console.log('Uint8Array(32) created!');
            // stack trace
            console.log(new Error().stack);
        }
        return new origUint8Array(...args);
    };
    // Need to set up inheritance properly if we overwrite Uint8Array
    Object.setPrototypeOf(window.Uint8Array, origUint8Array);
    window.Uint8Array.prototype = origUint8Array.prototype;

  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
