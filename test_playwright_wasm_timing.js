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
    // If the ChaCha20 decryption is written in pure WASM, it will read the ciphertext, nonce, and key from memory.
    // If we take a snapshot of memory right when fetch returns, the ciphertext and nonce and key must be in memory somewhere!
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        if (url && url.includes('/fetch')) {
            const res = await origFetch.apply(this, args);
            // clone the response so WASM gets its data
            const resClone = res.clone();
            
            // Wait for WASM to decrypt.
            // Since JS is single-threaded, if we setTimeout, WASM might have already run in microtask.
            // But WASM might do it synchronously right after wait fetch.
            return new Proxy(resClone, {
                get(target, prop) {
                    if (prop === 'arrayBuffer') {
                        return async function() {
                            const buf = await target.arrayBuffer();
                            // Right after this returns, WASM will decrypt it!
                            // Let's hook the WASM memory directly after this resolves.
                            setTimeout(() => {
                                if (window.wasmInstance) {
                                    const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                                    // dump it
                                    window.memDumpAfterFetch = Array.from(mem);
                                }
                            }, 0);
                            return buf;
                        }
                    }
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
        }
        return origFetch.apply(this, args);
    };

    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const memDump = await page.evaluate(() => window.memDumpAfterFetch);
  if (memDump) {
      fs.writeFileSync('wasm_mem_after_fetch.bin', Buffer.from(memDump));
      console.log('Saved wasm_mem_after_fetch.bin');
  }

  await browser.close();
})();
