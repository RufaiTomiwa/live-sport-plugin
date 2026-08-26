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
    // If the TextDecoder isn't reading directly from WASM memory (u8.buffer !== wasmMemory.buffer),
    // it means WASM calls an imported JS function that allocates a new Uint8Array or copies the string.
    // Let's hook the JS imports again.
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const wbg = imports['./locked_bg.js'];
      for (const funcName in wbg) {
          if (typeof wbg[funcName] === 'function') {
              const orig = wbg[funcName];
              wbg[funcName] = function(...args) {
                  // check if any of the args are pointers to the m3u8 string
                  if (args.length >= 2 && window.wasmInstance) {
                      const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                      const ptr = args[0];
                      const len = args[1];
                      if (ptr > 0 && len > 0 && ptr+len < mem.length) {
                          try {
                              const bytes = mem.subarray(ptr, ptr+len);
                              const str = new TextDecoder().decode(bytes);
                              if (str.includes('m3u8')) {
                                  console.log('JS IMPORT ' + funcName + ' CALLED WITH M3U8! ptr=' + ptr);
                                  // NOW WE HAVE THE POINTER! Let's dump the 128 bytes BEFORE the pointer!
                                  if (ptr >= 128) {
                                      const before = mem.subarray(ptr - 128, ptr);
                                      console.log('128 BYTES BEFORE M3U8:', Buffer.from(before).toString('hex'));
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
  
  await browser.close();
})();
