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
    // Maybe WASM decrypts the data chunk-by-chunk without storing the whole ciphertext in memory at once? Unlikely.
    // Let's hook the WebAssembly Math.random or crypto.getRandomValues. If the key is dynamically generated using random values, we'll see it!
    // We already hooked crypto.subtle.
    const origGetRandomValues = window.crypto.getRandomValues;
    window.crypto.getRandomValues = function(array) {
        console.log('crypto.getRandomValues called with size:', array.length);
        return origGetRandomValues.call(this, array);
    }
    
    const origNow = Date.now;
    Date.now = function() {
        // console.log('Date.now called');
        return origNow.call(this);
    }
    
    // What if the key is derived from the page HTML or some other element?
    // Let's log any document.querySelector from WASM.
    const origQuerySelector = Document.prototype.querySelector;
    Document.prototype.querySelector = function(selector) {
        console.log('querySelector:', selector);
        return origQuerySelector.call(this, selector);
    }
    
    const origGetElementById = Document.prototype.getElementById;
    Document.prototype.getElementById = function(id) {
        console.log('getElementById:', id);
        return origGetElementById.call(this, id);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
