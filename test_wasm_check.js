const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', async msg => {
      console.log('BROWSER:', msg.text());
  });

  await page.addInitScript(() => {
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(...args) {
        console.log("WASM INSTANTIATE STREAMING CALLED!", args[0].url);
        return origInstantiateStreaming.apply(this, args);
    };
    const origInstantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(...args) {
        console.log("WASM INSTANTIATE CALLED!");
        return origInstantiate.apply(this, args);
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
