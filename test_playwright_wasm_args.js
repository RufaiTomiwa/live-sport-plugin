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
    window.fetchDone = false;
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const wbg = imports['./locked_bg.js'];
      if (wbg) {
          for (const funcName in wbg) {
              if (typeof wbg[funcName] === 'function') {
                  const orig = wbg[funcName];
                  wbg[funcName] = function(...args) {
                      if (window.fetchDone) {
                          // Try to decode arguments if they are strings (pointers)
                          let argStr = args.map(a => {
                              if (typeof a === 'number' && window.wasmInstance) {
                                  // it might be a string pointer! but we don't know the length.
                                  return a;
                              }
                              return a;
                          }).join(', ');
                          console.log('JS IMPORT ' + funcName + ' args: ' + argStr);
                      }
                      return orig.apply(this, args);
                  }
              }
          }
      }
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
    
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
                            window.fetchDone = true;
                            console.log('--- FETCH RESOLVED ---');
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
