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
    // There was an issue with full_mem.bin not saving. Let's make sure window.fullMemDumpBeforeM3u8 is accessible in evaluate.
    // Sometimes Array.from(mem) is too large to serialize over playwright evaluate bridge (WASM mem is a few MBs)
    // We should convert it to hex or base64 or write to a blob url, or just evaluate return false.
    // Let's use a smaller slice around the ciphertext if we know where it is, BUT we don't.
    // Instead, we can just intercept WASM memory and search inside the page itself, then return the search results!
    
    window.searchResults = [];
    
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
                            window.fetchBodyBytes = new Uint8Array(buf);
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
      const wbg = imports['./locked_bg.js'];
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      
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
                                  // This is the EXACT MOMENT the decrypted string is being exported!
                                  // Let's search the WASM memory for the goat nonce and the fetch body!
                                  
                                  const searchFor = (mem, arr) => {
                                      if(!arr || arr.length === 0) return -1;
                                      for (let i = 0; i < mem.length - arr.length; i++) {
                                          let match = true;
                                          for (let j = 0; j < arr.length; j++) {
                                              if (mem[i+j] !== arr[j]) { match = false; break; }
                                          }
                                          if (match) return i;
                                      }
                                      return -1;
                                  };
                                  
                                  if (window.goatHeader) {
                                      // decode base64 in browser
                                      const binaryString = atob(window.goatHeader);
                                      const nonce = new Uint8Array(binaryString.length);
                                      for (let i = 0; i < binaryString.length; i++) nonce[i] = binaryString.charCodeAt(i);
                                      
                                      window.searchResults.push({ name: 'nonce', idx: searchFor(mem, nonce) });
                                      window.searchResults.push({ name: 'nonce_12', idx: searchFor(mem, nonce.subarray(0, 12)) });
                                  }
                                  if (window.fetchBodyBytes) {
                                      const ct = window.fetchBodyBytes.subarray(3);
                                      window.searchResults.push({ name: 'ciphertext', idx: searchFor(mem, ct) });
                                      window.searchResults.push({ name: 'ciphertext_16', idx: searchFor(mem, ct.subarray(0, 16)) });
                                  }
                                  
                                  // Since we don't find the key or the nonce in memory, it might be dynamically generated and discarded.
                                  // What if the decryption function takes the ciphertext pointer, length, and key pointer?
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
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const results = await page.evaluate(() => window.searchResults);
  console.log('Search Results:', results);

  await browser.close();
})();
