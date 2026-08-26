const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    extraHTTPHeaders: { 'Referer': 'https://streamed.pk/' }
  });
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    window.wasmMem = null;
    const origInstantiate = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, importObject) {
      console.log('Intercepted WebAssembly.instantiateStreaming');
      const result = await origInstantiate(response, importObject);
      window.wasmMem = result.instance.exports.memory;
      window.wasmExports = Object.keys(result.instance.exports);
      return result;
    };
    
    // Intercept JWPlayer to get the m3u8
    window.extractedM3u8 = null;
    window.jwplayer = () => ({
        setup: (c) => { 
            console.log('JWPlayer Setup called:', c.file);
            window.extractedM3u8 = c.file; 
        }
    });
  });

  page.on('console', msg => console.log('PAGE:', msg.text()));

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { waitUntil: 'networkidle' });

  // Wait for m3u8
  await page.waitForFunction(() => window.extractedM3u8 !== null, { timeout: 10000 }).catch(() => console.log('Timeout waiting for M3U8'));

  const m3u8 = await page.evaluate(() => window.extractedM3u8);
  console.log('Extracted M3U8:', m3u8);

  // Dump WASM memory
  const memData = await page.evaluate(() => {
      if (!window.wasmMem) return null;
      const arr = new Uint8Array(window.wasmMem.buffer);
      // return as hex string so we can parse it in Node
      return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  });
  
  if (memData) {
      fs.writeFileSync('wasm_mem_dump.bin', Buffer.from(memData, 'hex'));
      console.log('Dumped WASM memory to wasm_mem_dump.bin! Size:', memData.length / 2);
  } else {
      console.log('WASM memory not found.');
  }

  await browser.close();
})();
