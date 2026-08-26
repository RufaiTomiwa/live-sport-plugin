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

  page.on('response', async res => {
      const url = res.url();
      if (url.includes('/fetch')) {
          const goat = await res.headerValue('goat');
          console.log('Intercepted goat header from response:', goat);
          await page.evaluate((g) => { window.goatHeader = g; }, goat);
      }
  });

  await page.addInitScript(() => {
    window.fetchDone = false;
    
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (array && (array.length === 179 || array.length === 176)) {
            console.log('Uint8Array.set FETCH len:', array.length, 'offset:', offset);
            window.cipherArray = Array.from(array);
        }
        return origSet.apply(this, arguments);
    }
    
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                console.log('M3U8 string found! Taking memory dump of WASM memory NOW!');
                if (window.wasmInstance) {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.finalMemDump = Array.from(mem);
                }
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  const goat = await page.evaluate(() => window.goatHeader);
  console.log('Final goat:', goat);
  fs.writeFileSync('goat5.txt', goat || '');
  
  const cipher = await page.evaluate(() => window.cipherArray);
  if (cipher) fs.writeFileSync('run_cipher5.bin', Buffer.from(cipher));

  const dump = await page.evaluate(() => window.finalMemDump);
  if (dump) fs.writeFileSync('mem_at_decode5.bin', Buffer.from(dump));

  await browser.close();
})();
