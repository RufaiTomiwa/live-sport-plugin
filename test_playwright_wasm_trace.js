const { chromium } = require('playwright');
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
    // Let's hook the WebAssembly function calls themselves!
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      console.log('Intercepted WebAssembly.instantiateStreaming');
      const result = await origInstantiateStreaming(response, imports);
      
      const exports = result.instance.exports;
      const proxyExports = new Proxy(exports, {
          get(target, prop) {
              const orig = target[prop];
              if (typeof orig === 'function' && prop !== 'memory') {
                  return function(...args) {
                      console.log('CALL WASM EXPORT:', prop, 'ARGS:', args);
                      return orig.apply(this, args);
                  }
              }
              return orig;
          }
      });
      
      // we need to return a proxy of the instance
      return {
          module: result.module,
          instance: new Proxy(result.instance, {
              get(target, prop) {
                  if (prop === 'exports') return proxyExports;
                  return target[prop];
              }
          })
      };
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
