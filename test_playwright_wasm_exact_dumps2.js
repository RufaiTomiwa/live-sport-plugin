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
        if (array && (array.length === 179 || array.length === 176)) {
            console.log('Uint8Array.set called!');
            console.log('this.buffer === wasmMemory?', window.wasmInstance && this.buffer === window.wasmInstance.exports.memory.buffer);
            console.log('this.byteOffset:', this.byteOffset);
            console.log('this.length:', this.length);
            console.log('offset:', offset);
            
            window.cipherArray = Array.from(array);
        }
        
        origSet.apply(this, arguments);
        
        if (array && (array.length === 179 || array.length === 176)) {
            const afterSet = [];
            for (let i = 0; i < this.length; i++) {
                afterSet.push(this[i]);
            }
            console.log('Data in WASM memory after set matches array?', window.cipherArray.every((v, i) => v === afterSet[i]));
            
            if (window.wasmInstance) {
                const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                window.memDumpExactlyAfterSet = Array.from(mem);
                console.log('Took dump exactly after set!');
            }
        }
    }
    
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                if (window.wasmInstance && !window.memDumpExactlyAtDecode) {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.memDumpExactlyAtDecode = Array.from(mem);
                    console.log('Took dump exactly at decode! ptr:', u8.byteOffset);
                }
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const dumps = await page.evaluate(() => {
      return { write: window.memDumpExactlyAfterSet, decode: window.memDumpExactlyAtDecode, cipher: window.cipherArray };
  });
  if (dumps && dumps.write && dumps.decode) {
      fs.writeFileSync('mem_at_write2.bin', Buffer.from(dumps.write));
      fs.writeFileSync('mem_at_decode2.bin', Buffer.from(dumps.decode));
      fs.writeFileSync('run_cipher2.bin', Buffer.from(dumps.cipher));
      console.log('Saved both exact dumps!');
  }

  await browser.close();
})();
