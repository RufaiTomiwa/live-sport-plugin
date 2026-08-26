const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // We want to intercept WASM memory right after it does the fetch!
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('analytics')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  page.on('console', msg => {
      console.log(msg.text());
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(5000);
  
  // Dump the entire wasm memory!
  const dumped = await page.evaluate(() => {
    // find the wasm memory! It should be in window.wasmMemory or something?
    // Actually, web-sys keeps wasm module in module scope.
    // We can search all objects in window for WebAssembly.Memory
    function findMemory(obj, seen) {
        if (!obj || typeof obj !== 'object') return null;
        if (seen.has(obj)) return null;
        seen.add(obj);
        if (obj instanceof WebAssembly.Memory) return obj.buffer;
        for (let key in obj) {
            try {
                let res = findMemory(obj[key], seen);
                if (res) return res;
            } catch(e){}
        }
        return null;
    }
    const mem = findMemory(window, new Set());
    if (mem) {
        return Array.from(new Uint8Array(mem));
    }
    return null;
  });
  
  if (dumped) {
      require('fs').writeFileSync('wasm_mem_playwright.bin', Buffer.from(dumped));
      console.log('Saved memory dump to wasm_mem_playwright.bin');
  } else {
      console.log('WASM memory not found on window object.');
  }

  await browser.close();
})();
