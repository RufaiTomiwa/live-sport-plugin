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
    // Intercept crypto.subtle calls!
    const origSubtle = window.crypto.subtle;
    window.crypto.subtle = new Proxy(origSubtle, {
        get(target, prop) {
            const origFunc = target[prop];
            if (typeof origFunc === 'function') {
                return async function(...args) {
                    console.log('CRYPTO CALL:', prop, args[0]);
                    
                    if (prop === 'importKey') {
                        // try to extract raw key
                        if (args[0] === 'raw') {
                            const buf = new Uint8Array(args[1]);
                            console.log('IMPORT_KEY RAW HEX:', Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join(''));
                        }
                    }
                    if (prop === 'decrypt' || prop === 'encrypt') {
                        if (args[0].iv) {
                            const iv = new Uint8Array(args[0].iv);
                            console.log('IV HEX:', Array.from(iv).map(b=>b.toString(16).padStart(2,'0')).join(''));
                        }
                        const buf = new Uint8Array(args[2]);
                        console.log('DATA HEX:', Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join(''));
                    }
                    
                    return origFunc.apply(this, args);
                }
            }
            return origFunc;
        }
    });
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
