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
      console.log('Intercepted WebAssembly.instantiateStreaming');
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const wasmData = await page.evaluate(() => {
     if (window.wasmInstance) {
         const exports = window.wasmInstance.exports;
         let memFound = false;
         let memDump = null;
         
         if (exports.memory) {
             memFound = true;
             // Dump entire memory
             memDump = Array.from(new Uint8Array(exports.memory.buffer));
         }
         return { memFound, memDump };
     }
     return { error: 'No instance' };
  });

  if (wasmData.memDump) {
      fs.writeFileSync('wasm_mem_playwright_3.bin', Buffer.from(wasmData.memDump));
      console.log('Memory dumped to wasm_mem_playwright_3.bin');
  }

  await browser.close();
})();
