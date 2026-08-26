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
    // Maybe WASM reads all headers via iterators?
    // Let's hook the WebAssembly function calls instead!
    // Since WASM interacts with JS using web-sys, all JS calls go through the JS glue locked_bg.js.
    // The glue script has imports like __wbg_get_xxxx.
    // Let's hook EVERY single function exported by locked_bg.js (which is imported by WASM).
    // And log arguments.
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const wbg = imports['./locked_bg.js'];
      
      for (const funcName in wbg) {
          if (typeof wbg[funcName] === 'function') {
              const orig = wbg[funcName];
              wbg[funcName] = function(...args) {
                  // We only care about calls that happen AFTER fetch finishes
                  if (window.fetchDone) {
                      let argStrings = [];
                      const mem = window.wasmInstance ? new Uint8Array(window.wasmInstance.exports.memory.buffer) : null;
                      
                      for(let i=0; i<args.length; i++) {
                          const arg = args[i];
                          if (typeof arg === 'string') argStrings.push('"' + arg + '"');
                          else if (typeof arg === 'number') {
                              // is it a pointer?
                              if (mem && i < args.length-1 && typeof args[i+1] === 'number') {
                                  const ptr = arg;
                                  const len = args[i+1];
                                  if (ptr > 0 && len > 0 && len < 2000 && ptr+len < mem.length) {
                                      try {
                                          const bytes = mem.subarray(ptr, ptr+len);
                                          const hex = Buffer.from(bytes).toString('hex');
                                          // check if printable ascii
                                          let isAscii = true;
                                          for(let j=0; j<len; j++) if(bytes[j]<32 || bytes[j]>126) isAscii=false;
                                          if (isAscii) {
                                              const str = new TextDecoder().decode(bytes);
                                              argStrings.push('STR[' + str + ']');
                                          } else {
                                              argStrings.push('HEX[' + len + ':' + hex.substring(0,32) + '...]');
                                          }
                                      } catch(e) { argStrings.push(arg); }
                                  } else {
                                      argStrings.push(arg);
                                  }
                              } else {
                                  argStrings.push(arg);
                              }
                          } else if (typeof arg === 'object') {
                              argStrings.push(arg ? arg.constructor.name : 'null');
                          } else {
                              argStrings.push(arg);
                          }
                      }
                      
                      console.log('JS IMPORT ' + funcName + '(' + argStrings.join(', ') + ')');
                  }
                  return orig.apply(this, args);
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
