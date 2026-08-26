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
    // the previous playwright script failed to save memAroundCiphertext because page.evaluate(() => window.memAroundCiphertext) returned undefined
    // because it was assigned asynchronously *after* evaluate was called, or it was never called!
    // Let's hook Uint8Array.prototype.set and JUST LOG the first 16 bytes being written, to see if it IS the ciphertext!
    
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (window.fetchDone && array && array.length === window.fetchBodyLen) {
            console.log('Uint8Array.set called with fetch body! offset:', offset, 'length:', array.length);
            
            // log the first 16 bytes of rray to verify it's the ciphertext
            const arr = Array.from(array.slice(0, 16)).map(b => b.toString(16).padStart(2,'0')).join('');
            console.log('First 16 bytes of copied array:', arr);
            
            // log what's at this offset in WASM memory BEFORE writing
            if (window.wasmInstance) {
                const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                if (offset > 128) {
                    const before = mem.subarray(offset - 128, offset);
                    console.log('128 bytes in WASM before offset:', Array.from(before).map(b => b.toString(16).padStart(2,'0')).join(''));
                }
            }
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
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
