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
    // If mem0 already has the M3U8 string, it means the decryption happened *before* the first dump was taken!
    // The setInterval with 2ms was too slow! WASM decrypted it synchronously in the same event loop tick!
    // That means the decryption MUST happen immediately when etch resolves.
    
    const origSet = Uint8Array.prototype.set;
    Uint8Array.prototype.set = function(array, offset) {
        if (array && (array.length === 179 || array.length === 176)) {
            // this is synchronous!
            window.cipherTextPtr = this.byteOffset + (offset || 0);
            
            // TAKE DUMP EXACTLY HERE
            if (window.wasmInstance) {
                const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                window.memDumpExactlyAtWrite = Array.from(mem);
                console.log('Took dump exactly at write! ptr:', window.cipherTextPtr);
            }
        }
        return origSet.apply(this, arguments);
    }
    
    // Also we want to hook TextDecoder.decode and take a dump EXACTLY when it finishes!
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

    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const dumps = await page.evaluate(() => {
      return { write: window.memDumpExactlyAtWrite, decode: window.memDumpExactlyAtDecode };
  });
  if (dumps && dumps.write && dumps.decode) {
      fs.writeFileSync('mem_at_write.bin', Buffer.from(dumps.write));
      fs.writeFileSync('mem_at_decode.bin', Buffer.from(dumps.decode));
      console.log('Saved both exact dumps!');
  }

  await browser.close();
})();
