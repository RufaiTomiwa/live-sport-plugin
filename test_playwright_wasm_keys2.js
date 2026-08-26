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
      const stringArgs = {};
      
      for (const funcName in wbg) {
          if (typeof wbg[funcName] === 'function') {
              const orig = wbg[funcName];
              wbg[funcName] = function(...args) {
                  if (args.length >= 2 && window.wasmInstance) {
                      const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                      const ptr = args[0];
                      const len = args[1];
                      if (ptr > 0 && ptr < mem.length && len > 0 && len < 1000) {
                          try {
                             const bytes = mem.subarray(ptr, ptr+len);
                             const str = new TextDecoder().decode(bytes);
                             const hex = Buffer.from(bytes).toString('hex');
                             if (len === 32 || str.includes('http')) {
                                 console.log('IMPORT ' + funcName + ' LEN ' + len + ' HEX: ' + hex + ' STR: ' + str);
                             }
                          } catch(e){}
                      }
                  }
                  return orig.apply(this, args);
              }
          }
      }
      
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      
      // Hook the wasm functions!
      const exports = result.instance.exports;
      for (const funcName in exports) {
          if (typeof exports[funcName] === 'function' && funcName !== 'memory') {
              const orig = exports[funcName];
              exports[funcName] = function(...args) {
                  // check if any args are pointers to 32 byte strings
                  const mem = new Uint8Array(exports.memory.buffer);
                  for (let i = 0; i < args.length; i++) {
                      const ptr = args[i];
                      if (ptr > 0 && ptr < mem.length - 32) {
                          const str = new TextDecoder().decode(mem.subarray(ptr, ptr+32));
                          const hex = Buffer.from(mem.subarray(ptr, ptr+32)).toString('hex');
                          if (hex.match(/^[0-9a-f]{64}$/) || hex.match(/^[0-9a-fA-F]{64}$/)) {
                              console.log('EXPORT ' + funcName + ' ARG ' + i + ' IS HEX KEY:', hex);
                          }
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
  
  await browser.close();
})();
