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
    // Intercept WASM imports! (e.g. env or wbg)
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      console.log('Intercepted WebAssembly.instantiateStreaming');
      console.log('IMPORTS KEYS:', Object.keys(imports));
      
      for (const moduleName in imports) {
          const imp = imports[moduleName];
          for (const funcName in imp) {
              if (typeof imp[funcName] === 'function') {
                  const orig = imp[funcName];
                  imp[funcName] = function(...args) {
                      // print arg types and values
                      // console.log(IMPORT CALL: ., args);
                      return orig.apply(this, args);
                  }
              }
          }
      }
      
      return await origInstantiateStreaming(response, imports);
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
