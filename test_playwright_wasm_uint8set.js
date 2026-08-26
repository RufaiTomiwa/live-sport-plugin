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
    // If the JS glue code gets the ArrayBuffer, it probably copies it into WASM memory using an exported allocate function
    // Let's hook Uint8Array.prototype.set to see where it copies the fetch result.
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (window.fetchDone && array && array.length === window.fetchBodyLen) {
            console.log('Uint8Array.set called with fetch body! offset:', offset, 'length:', array.length);
            // This offset is the pointer in WASM memory where the ciphertext is stored!
            window.cipherTextPtr = offset;
        }
        return origSet.apply(this, arguments);
    }
    
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[0].includes('/fetch')) {
            const res = await origFetch.apply(this, args);
            const resClone = res.clone();
            
            return new Proxy(resClone, {
                get(target, prop) {
                    if (prop === 'arrayBuffer') {
                        return async function() {
                            const buf = await target.arrayBuffer();
                            window.fetchBodyLen = buf.byteLength;
                            window.fetchDone = true;
                            console.log('--- FETCH RESOLVED --- len = ' + window.fetchBodyLen);
                            return buf;
                        }
                    }
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
        }
        return origFetch.apply(this, args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
