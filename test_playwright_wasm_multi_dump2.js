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
    // WASM memory dumping: let's dump the memory *before* decryption and *after* decryption!
    // Since fetch returning is when decryption starts...
    
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
                            console.log('GOT FETCH BUF, size:', buf.byteLength);
                            
                            // dump 1
                            if (window.wasmInstance) {
                                window.memDumps = [];
                                window.memDumps.push(Array.from(new Uint8Array(window.wasmInstance.exports.memory.buffer)));
                                
                                // start a tight loop dumping memory every 5ms
                                let count = 0;
                                let int = setInterval(() => {
                                    if(window.wasmInstance) {
                                        window.memDumps.push(Array.from(new Uint8Array(window.wasmInstance.exports.memory.buffer)));
                                    }
                                    count++;
                                    if (count > 20) clearInterval(int);
                                }, 10);
                            }
                            
                            return buf;
                        }
                    }
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
        }
        return origFetch.apply(this, args);
    };

    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const dumps = await page.evaluate(() => window.memDumps);
  if (dumps) {
      for(let i=0; i<dumps.length; i++) {
          fs.writeFileSync('wasm_mem_dmp_' + i + '.bin', Buffer.from(dumps[i]));
      }
      console.log('Saved ' + dumps.length + ' memory dumps.');
  }

  await browser.close();
})();
