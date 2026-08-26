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
      let importedStrings = [];
      
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
                             if (len === 32 || len === 12 || len === 24 || len === 16) {
                                 console.log('IMPORT ' + funcName + ' LEN ' + len + ' HEX: ' + hex);
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
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
