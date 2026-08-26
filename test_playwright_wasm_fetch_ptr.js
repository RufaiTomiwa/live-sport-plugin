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
        const res = await origFetch.apply(this, args);
        if (args[0].includes('/fetch')) {
            const resClone = res.clone();
            return new Proxy(resClone, {
                get(target, prop) {
                    if (prop === 'arrayBuffer') {
                        return async function() {
                            const buf = await target.arrayBuffer();
                            const u8 = new Uint8Array(buf);
                            
                            // The response is a Protobuf.
                            // Byte 0: field tag. Byte 1,2: length.
                            // Since JS calls WASM, maybe WASM has an export that takes a pointer to this buffer?
                            // Let's hook all WASM exports to see if any takes a pointer to our buffer.
                            window.fetchBufHex = Array.from(u8).map(b => b.toString(16).padStart(2,'0')).join('');
                            return buf;
                        }
                    }
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
        }
        return res;
    };

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
                      // Check if any arg points to a string matching our buffer
                      if (window.fetchBufHex && args.length >= 2) {
                          const mem = new Uint8Array(target.memory.buffer);
                          for(let i=0; i<args.length; i++) {
                              const ptr = args[i];
                              const len = args[i+1];
                              if (typeof ptr === 'number' && typeof len === 'number' && ptr > 0 && len > 0 && ptr+len < mem.length) {
                                  const hex = Buffer.from(mem.subarray(ptr, ptr+len)).toString('hex');
                                  if (hex === window.fetchBufHex || hex.includes(window.fetchBufHex.substring(0, 32))) {
                                      console.log('WASM EXPORT CALLED WITH FETCH BUF:', prop);
                                  }
                              }
                          }
                      }
                      return orig.apply(this, args);
                  }
              }
              return orig;
          }
      });
      
      return {
          module: result.module,
          instance: new Proxy(result.instance, {
              get(t, p) { if (p === 'exports') return proxyExports; return t[p]; }
          })
      };
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
