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
    window.dataToSave = {};
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                window.dataToSave.m3u8 = str;
                if (window.wasmInstance) {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.dataToSave.mem = Array.from(mem);
                }
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }

    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[0].includes('/fetch')) {
            const res = await origFetch.apply(this, args);
            window.dataToSave.goat = res.headers.get('goat');
            const resClone = res.clone();
            return new Proxy(resClone, {
                get(target, prop) {
                    if (prop === 'arrayBuffer') {
                        return async function() {
                            const buf = await target.arrayBuffer();
                            window.dataToSave.cipher = Array.from(new Uint8Array(buf));
                            return buf;
                        }
                    }
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
        }
        return origFetch.apply(this, args);
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
  
  const data = await page.evaluate(() => window.dataToSave);
  if (data && data.mem) {
      fs.writeFileSync('run_mem.bin', Buffer.from(data.mem));
      fs.writeFileSync('run_cipher.bin', Buffer.from(data.cipher));
      fs.writeFileSync('run_m3u8.txt', data.m3u8);
      fs.writeFileSync('run_goat.txt', data.goat);
      console.log('SAVED RUN DATA');
  } else {
      console.log('NO DATA SAVED');
  }

  await browser.close();
})();
