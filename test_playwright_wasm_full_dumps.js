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
        if (array && array.length > 100 && array.length < 300 && array[0] === 0x0a) {
            window.cipherTextPtr = offset;
            
            if (window.wasmInstance) {
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
