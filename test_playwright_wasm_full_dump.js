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
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const wbg = imports['./locked_bg.js'];
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      
      // Dump the entire memory right before the M3U8 string is exported
      for (const funcName in wbg) {
          if (typeof wbg[funcName] === 'function') {
              const orig = wbg[funcName];
              wbg[funcName] = function(...args) {
                  if (args.length >= 2 && window.wasmInstance) {
                      const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                      const ptr = args[0];
                      const len = args[1];
                      if (typeof ptr === 'number' && typeof len === 'number' && ptr > 0 && len > 0 && ptr+len < mem.length) {
                          try {
                              const bytes = mem.subarray(ptr, ptr+len);
                              const str = new TextDecoder().decode(bytes);
                              if (str.includes('m3u8')) {
                                  if (!window.fullMemDumped) {
                                      window.fullMemDumpBeforeM3u8 = Array.from(mem);
                                      window.fullMemDumped = true;
                                  }
                              }
                          } catch(e) {}
                      }
                  }
                  return orig.apply(this, args);
              }
          }
      }
      
      return result;
    };
    
    // Also save the fetch body and nonce
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[0].includes('/fetch')) {
            const res = await origFetch.apply(this, args);
            window.goatHeader = res.headers.get('goat');
            const resClone = res.clone();
            return new Proxy(resClone, {
                get(target, prop) {
                    if (prop === 'arrayBuffer') {
                        return async function() {
                            const buf = await target.arrayBuffer();
                            window.fetchBodyBytes = Array.from(new Uint8Array(buf));
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
  
  const data = await page.evaluate(() => {
      return {
          mem: window.fullMemDumpBeforeM3u8,
          goat: window.goatHeader,
          body: window.fetchBodyBytes
      };
  });
  
  if (data.mem) {
      fs.writeFileSync('full_mem.bin', Buffer.from(data.mem));
      fs.writeFileSync('goat.txt', data.goat);
      fs.writeFileSync('body.bin', Buffer.from(data.body));
      console.log('Saved all!');
  }

  await browser.close();
})();
