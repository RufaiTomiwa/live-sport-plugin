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
    // Also let's log any WASM export that gets called after fetch resolves!
    // lock.wasm exports things like memory, but also functions.
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      
      const exports = result.instance.exports;
      const proxyExports = new Proxy(exports, {
          get(target, prop) {
              const orig = target[prop];
              if (typeof orig === 'function' && prop !== 'memory') {
                  return function(...args) {
                      if (window.fetchDone) {
                          console.log('WASM EXPORT CALLED:', prop, 'args:', args);
                      }
                      return orig.apply(this, args);
                  }
              }
              return orig;
          }
      });
      
      // we must hook the object returned
      return {
          module: result.module,
          instance: new Proxy(result.instance, {
              get(t, p) { if (p === 'exports') return proxyExports; return t[p]; }
          })
      };
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
