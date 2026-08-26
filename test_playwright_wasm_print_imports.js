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
    // If the data is being parsed, we could also just decompile lock.wasm with wasm2wat.
    // Let's dump the WASM imports but instead of Math.random, check performance.now and crypto.getRandomValues.
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      console.log('WASM imports:', Object.keys(imports));
      if (imports['./locked_bg.js']) {
          console.log('locked_bg imports:', Object.keys(imports['./locked_bg.js']));
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
