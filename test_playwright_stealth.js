const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', async msg => {
      console.log('BROWSER:', msg.text());
  });
  
  const wasmBuffer = fs.readFileSync('lock_new.wasm');
  
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('analytics')) {
      route.abort();
    } else if (url.includes('lock.wasm')) {
      route.fulfill({
        status: 200,
        contentType: 'application/wasm',
        body: wasmBuffer
      });
      console.log("Mocked lock.wasm!");
    } else {
      route.continue();
    }
  });

  await page.addInitScript(() => {
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
        console.log("WASM INSTANTIATE STREAMING CALLED!", response.url);
        const wbg = imports['./locked_bg.js'];
        const result = await origInstantiateStreaming(response, imports);
        window.wasmInstance = result.instance;
        
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
                                    console.log("FOUND M3U8 IN MEMORY!", str);
                                    window.decryptedM3u8 = str;
                                }
                            } catch(e) {}
                        }
                    }
                    return orig.apply(this, args);
                }
            }
        }
        return result;
    };
  });

  console.log("Going to embed.st...");
  await page.goto('https://embed.st/embed/admin/admin-sky-sports-main-event/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(10000); 
  
  const m3u8 = await page.evaluate(() => window.decryptedM3u8);
  console.log("Decrypted M3U8:", m3u8);
  
  // also dump full memory just in case
  const memBase64 = await page.evaluate(() => {
      if (window.wasmInstance && window.wasmInstance.exports.memory) {
          const arr = new Uint8Array(window.wasmInstance.exports.memory.buffer);
          let binary = '';
          for (let i = 0; i < arr.byteLength; i++) {
              binary += String.fromCharCode(arr[i]);
          }
          return btoa(binary);
      }
      return null;
  });
  
  if (memBase64) {
      fs.writeFileSync("wasm_mem_playwright_new.bin", Buffer.from(memBase64, 'base64'));
      console.log("Dumped full memory to disk.");
  }
  
  await browser.close();
})();
