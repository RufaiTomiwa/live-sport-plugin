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
      // Maybe they do use window.crypto? We hooked window.crypto.subtle, but not window.crypto.getRandomValues!
      const origGetRandomValues = window.crypto.getRandomValues;
      window.crypto.getRandomValues = function(buf) {
          console.log('getRandomValues called! Length:', buf.byteLength);
          return origGetRandomValues.call(this, buf);
      };
      
      // Let's also check if they read localStorage or indexedDB!
      const origGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function(key) {
          console.log('localStorage.getItem:', key);
          return origGetItem.call(this, key);
      }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
