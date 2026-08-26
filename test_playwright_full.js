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

  page.on('response', async res => {
      if (res.url().includes('/fetch')) {
          const goat = res.headers()['goat'];
          fs.writeFileSync('goat_nonce.txt', goat || '');
          const buf = await res.body();
          fs.writeFileSync('fetch_payload.bin', buf);
          console.log('Saved fetch_payload.bin and goat_nonce.txt');
      }
  });

  await page.addInitScript(() => {
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
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
         if (exports.memory) {
             return Array.from(new Uint8Array(exports.memory.buffer));
         }
     }
     return null;
  });

  if (wasmData) {
      fs.writeFileSync('wasm_mem.bin', Buffer.from(wasmData));
      console.log('Saved wasm_mem.bin');
  }

  await browser.close();
})();
