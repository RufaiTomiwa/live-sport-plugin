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
    // Override window.fetch entirely to capture the exact ArrayBuffer it returns
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[0].includes('/fetch')) {
            console.log('FETCH CALLED with args:', args);
            if (args[1] && args[1].body) {
                // If the body is a Uint8Array
                if (args[1].body instanceof Uint8Array) {
                   console.log('FETCH BODY HEX:', Array.from(args[1].body).map(b => b.toString(16).padStart(2, '0')).join(''));
                }
            }
        }
        return origFetch.apply(this, args);
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
