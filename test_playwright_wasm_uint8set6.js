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
    // If the data is being parsed as Protobuf BEFORE it's written to WASM memory, Uint8Array.set wouldn't receive a 179 byte buffer, it would receive individual fields!
    // But we know it receives a 179 byte buffer from our previous Uint8Array.set POTENTIAL FETCH BODY! len: 179 ptr: 1115384 logs!
    // Why did 	est_playwright_wasm_uint8set4.js not trigger it?
    // Maybe rray[0] === 0x0a wasn't true? Let's check rray.length === 179.
    
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (array && (array.length === 179 || array.length === 176)) {
            console.log('Uint8Array.set FETCH BODY! len:', array.length, 'offset:', offset);
            window.cipherTextPtr = offset;
            
            if (window.wasmInstance) {
                // start taking full dumps
                window.fullDumps = [];
                let int = setInterval(() => {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.fullDumps.push(Array.from(mem));
                    if (window.fullDumps.length >= 5) clearInterval(int);
                }, 2);
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
  
  const dumps = await page.evaluate(() => window.fullDumps);
  if (dumps) {
      for (let i = 0; i < dumps.length; i++) {
          fs.writeFileSync('full_dump_' + i + '.bin', Buffer.from(dumps[i]));
      }
      console.log('Saved ' + dumps.length + ' full dumps');
  }

  await browser.close();
})();
