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
    // So there is NO Math.random or crypto.getRandomValues imported into WASM!
    // But Math.random WAS called during execution according to our hook!
    // If WASM didn't call it, then locked_bg.js or locked.js called it!
    
    // The key is NOT passed dynamically from outside, nor is crypto imported.
    // That means the ChaCha20 key MUST BE GENERATED PURELY IN WASM USING NO JS IMPORTS!
    // Which means the key is deterministic based on the URL path (/embed/admin/admin-tennis-channel/1)!
    
    // What if the key is just a hash of the URL?
    // Let's hook the WASM execution from the JS side and pass dummy values for the URL path!
    // To do that, we hook the location.pathname or similar.
    
    const origPathname = Object.getOwnPropertyDescriptor(window.location.__proto__, 'pathname');
    Object.defineProperty(window.location, 'pathname', {
        get: function() {
            const p = origPathname.get.call(this);
            console.log('Pathname accessed!', p);
            return p;
        }
    });
    
    const origHref = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href');
    Object.defineProperty(window.location, 'href', {
        get: function() {
            const h = origHref.get.call(this);
            console.log('Href accessed!', h);
            return h;
        }
    });

  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
