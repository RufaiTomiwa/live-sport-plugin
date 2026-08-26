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
    // If TextEncoder is NOT used, the strings are passed directly!
    // And JS crypto isn't used!
    // That means all hashing and derivation is done purely in WASM.
    // If it's pure WASM, the only way the key is NOT in the exact memory dump is if the key is stored on the stack, not the heap (which can't be read from JS), OR if the memory dump is slightly off because Uint8Array.set happens AFTER decryption?!
    // Wait. etch resolves. Then the buffer is passed to WASM.
    // WASM must copy the buffer into its memory to decrypt it.
    // The JS glue code __wbindgen_cast_* or whatever copies it in!
    // THAT copying is what triggers Uint8Array.prototype.set!
    // SO our memory dump memDumpExactlyAfterSet is exactly when the encrypted payload is written to memory!
    // At that moment, the decryption hasn't happened yet!
    // And when is the key generated?
    // It could be generated BEFORE the fetch (and zeroized?), or AFTER the fetch payload is written?
    // If it's generated after, it should be in memory during decode!
    // Let's take 10 memory dumps quickly inside WASM decode!
    
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                if (window.wasmInstance) {
                    // It's already decrypted. The key might be zeroized.
                    console.log('Decoded m3u8! Taking dumps now!');
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
            console.log('fetch resolved!');
            
            // Take dumps asynchronously right after fetch resolves
            if (window.wasmInstance) {
                window.fetchDumps = [];
                let int = setInterval(() => {
                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                    window.fetchDumps.push(Array.from(mem));
                    if (window.fetchDumps.length >= 10) clearInterval(int);
                }, 1);
            }
            
            return res;
        }
        return origFetch.apply(this, args);
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  const dumps = await page.evaluate(() => window.fetchDumps);
  if (dumps) {
      for (let i=0; i<dumps.length; i++) {
          fs.writeFileSync('fetch_dump_'+i+'.bin', Buffer.from(dumps[i]));
      }
      console.log('Saved ' + dumps.length + ' dumps');
  }

  await browser.close();
})();
