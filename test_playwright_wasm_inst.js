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
    // Intercept both instantiate and instantiateStreaming
    const origInst = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(...args) {
      console.log('Intercepted WebAssembly.instantiate');
      const res = await origInst(...args);
      window.wasmInstance = res.instance;
      return res;
    };
    
    // rust wasm-bindgen often uses new WebAssembly.Instance
    const origInstance = WebAssembly.Instance;
    WebAssembly.Instance = function(...args) {
       console.log('Intercepted WebAssembly.Instance');
       const inst = new origInstance(...args);
       window.wasmInstance = inst;
       return inst;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const wasmData = await page.evaluate(() => {
     if (window.wasmInstance) {
         const exports = window.wasmInstance.exports;
         let memFound = false;
         let memDump = null;
         let keys = Object.keys(exports);
         
         if (exports.memory) {
             memFound = true;
             // Dump entire memory
             memDump = Array.from(new Uint8Array(exports.memory.buffer));
         }
         return { keys, memFound, memDump };
     }
     return { error: 'No instance' };
  });

  console.log('WASM Keys:', wasmData.keys);
  console.log('Memory found:', wasmData.memFound);
  
  if (wasmData.memDump) {
      fs.writeFileSync('wasm_mem_playwright_2.bin', Buffer.from(wasmData.memDump));
      console.log('Memory dumped to wasm_mem_playwright_2.bin');
  }

  await browser.close();
})();
