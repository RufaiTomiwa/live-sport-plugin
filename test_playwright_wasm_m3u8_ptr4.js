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
    // We saw the 128 bytes before the pointer:
    // ptr=1115752 (which is where M3U8 string starts)
    // 128 bytes before: 316f5e492a422526484e23467e7c472c...
    // Let's dump a LARGER area before the pointer!
    // Maybe 2048 bytes before.
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const wbg = imports['./locked_bg.js'];
      for (const funcName in wbg) {
          if (typeof wbg[funcName] === 'function') {
              const orig = wbg[funcName];
              wbg[funcName] = function(...args) {
                  if (args.length >= 2 && window.wasmInstance) {
                      const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                      const ptr = args[0];
                      const len = args[1];
                      if (typeof ptr === 'number' && typeof len === 'number' && ptr > 0 && len > 0 && ptr+len < mem.length) {
                          try {
                              const bytes = mem.subarray(ptr, ptr+len);
                              const str = new TextDecoder().decode(bytes);
                              if (str.includes('m3u8')) {
                                  console.log('JS IMPORT ' + funcName + ' CALLED WITH M3U8! ptr=' + ptr);
                                  if (ptr >= 2048) {
                                      const before = mem.subarray(ptr - 2048, ptr);
                                      window.memBeforeM3u8 = Array.from(before);
                                  }
                              }
                          } catch(e) {}
                      }
                  }
                  return orig.apply(this, args);
              }
          }
      }
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const before = await page.evaluate(() => window.memBeforeM3u8);
  if (before) {
      fs.writeFileSync('wasm_mem_before_m3u8.bin', Buffer.from(before));
      console.log('Saved wasm_mem_before_m3u8.bin');
  }

  await browser.close();
})();
