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
    // Uint8Array.prototype.set modifies the internal buffer, but maybe it hasn't propagated to our dump? No, Uint8Array is synchronous.
    // WAIT. If Uint8Array.prototype.set is called on a TypedArray whose uffer is WASM memory...
    // The rray being set IS the fetch body.
    // The data written into WASM memory IS the fetch body!
    // Why did indexOf fail? Because the fetch body changes EVERY time the request is made!
    // The server generates a new IV and ciphertext on every fetch!
    // That's why we can't find etch_payload.bin (which is from an older request) in this memory dump!
    
    // We need to write a script that does everything IN THE BROWSER and finds the key!
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (array && (array.length === 179 || array.length === 176)) {
            window.cipherTextBytes = Array.from(array); // store the actual ciphertext used in this run!
        }
        return origSet.apply(this, arguments);
    }
    
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                window.m3u8Str = str;
                if (window.wasmInstance) {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.memAtDecode = Array.from(mem);
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
            window.goatHeaderThisRun = res.headers.get('goat');
            return res;
        }
        return origFetch.apply(this, args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const data = await page.evaluate(() => {
      return {
          cipher: window.cipherTextBytes,
          m3u8: window.m3u8Str,
          mem: window.memAtDecode,
          goat: window.goatHeaderThisRun
      };
  });
  
  if (data.cipher && data.m3u8 && data.mem && data.goat) {
      fs.writeFileSync('run_cipher.bin', Buffer.from(data.cipher));
      fs.writeFileSync('run_m3u8.txt', data.m3u8);
      fs.writeFileSync('run_mem.bin', Buffer.from(data.mem));
      fs.writeFileSync('run_goat.txt', data.goat);
      console.log('Saved all run data!');
  }

  await browser.close();
})();
