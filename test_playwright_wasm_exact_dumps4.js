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
    // Wait, let's just write everything into a log file from Node by using the evaluate return
    // "Saved both exact dumps!" was NOT printed!
    // Why? Because dumps.cipher might have been empty?
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
    
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (array && (array.length === 179 || array.length === 176)) {
            window.cipherArray = Array.from(array);
        }
        
        origSet.apply(this, arguments);
        
        if (array && (array.length === 179 || array.length === 176)) {
            if (window.wasmInstance && this.buffer === window.wasmInstance.exports.memory.buffer) {
                const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                window.memDumpExactlyAfterSet = Array.from(mem);
                console.log('Took dump exactly after set! ptr:', this.byteOffset);
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
  if (dumps) {
      fs.writeFileSync('mem_at_write3.bin', Buffer.from(dumps.write));
      fs.writeFileSync('mem_at_decode3.bin', Buffer.from(dumps.decode));
      fs.writeFileSync('run_cipher3.bin', Buffer.from(dumps.cipher));
      console.log('Saved both exact dumps!');
  } else {
      console.log('NO DUMPS RETURNED');
  }

  await browser.close();
})();
