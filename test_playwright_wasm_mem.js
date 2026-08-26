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
      if (msg.text().includes('GOAT_NONCE=')) {
          console.log(msg.text());
      }
  });

  // Inject a script that overwrites WebAssembly.instantiate
  // to intercept the exports and grab the crypto state!
  await page.addInitScript(() => {
    const origInstantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(buffer, imports) {
      console.log('Intercepted WebAssembly.instantiate');
      const result = await origInstantiate(buffer, imports);
      window.wasmExports = result.instance.exports;
      return result;
    };
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[0].includes('/fetch')) {
            const res = await origFetch(...args);
            const goat = res.headers.get('goat');
            console.log('GOAT_NONCE=' + goat);
            // Clone response
            const resClone = res.clone();
            resClone.arrayBuffer().then(buf => {
                window.fetchPayload = new Uint8Array(buf);
            });
            return res;
        }
        return origFetch(...args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  // Try to find the m3u8 string inside WASM memory!
  const m3u8Data = await page.evaluate(() => {
     if (window.wasmExports && window.wasmExports.memory) {
         const mem = new Uint8Array(window.wasmExports.memory.buffer);
         const target = "playlist.m3u8";
         for (let i = 0; i < mem.length - target.length; i++) {
             let match = true;
             for (let j = 0; j < target.length; j++) {
                 if (mem[i+j] !== target.charCodeAt(j)) { match = false; break; }
             }
             if (match) {
                 return {
                     found: true,
                     offset: i,
                     context: Array.from(mem.slice(Math.max(0, i - 200), i + 100))
                 };
             }
         }
         return { found: false };
     }
     return { found: false, error: 'No memory' };
  });

  console.log('M3U8 Data:', m3u8Data);

  await browser.close();
})();
