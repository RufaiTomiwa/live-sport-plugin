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
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (array && array.length > 100 && array.length < 300) {
            if (array[0] === 0x0a) {
                console.log('Uint8Array.set POTENTIAL FETCH BODY! len:', array.length, 'offset:', offset);
                if (window.wasmInstance && this.buffer === window.wasmInstance.exports.memory.buffer) {
                    console.log('--- WRITING TO WASM MEMORY ---');
                    const mem = new Uint8Array(this.buffer);
                    if (offset >= 128) {
                        const before = mem.subarray(offset - 128, offset);
                        console.log('128 bytes in WASM before offset:', Array.from(before).map(b => b.toString(16).padStart(2,'0')).join(''));
                    }
                }
            }
        }
        return origSet.apply(this, arguments);
    }
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
