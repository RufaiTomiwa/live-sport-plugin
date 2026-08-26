const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
      console.log('BROWSER:', msg.text());
  });

  await page.addInitScript(() => {
    const origDecode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function(buf, ...args) {
        if (buf) {
            const u8 = new Uint8Array(buf.buffer ? buf.buffer : buf, buf.byteOffset || 0, buf.byteLength || buf.length);
            const str = origDecode.call(this, u8, ...args);
            if (str.includes('m3u8')) {
                console.log('M3U8 string found!');
                if (window.wasmInstance) {
                    console.log('Got wasm instance:', Object.keys(window.wasmInstance.exports));
                }
            }
            return str;
        }
        return origDecode.call(this, buf, ...args);
    }
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      console.log('WebAssembly.instantiateStreaming IMPORTS:', Object.keys(imports));
      for (const key in imports) {
          console.log('Import module:', key, 'keys:', Object.keys(imports[key]));
      }
      const result = await origInstantiateStreaming(response, imports);
      window.wasmInstance = result.instance;
      return result;
    };
    
    const origInstantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(buffer, imports) {
      console.log('WebAssembly.instantiate IMPORTS:', Object.keys(imports));
      for (const key in imports) {
          console.log('Import module:', key, 'keys:', Object.keys(imports[key]));
      }
      const result = await origInstantiate(buffer, imports);
      window.wasmInstance = result.instance || result;
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
