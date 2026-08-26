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
    // Maybe the decryption uses WASM standard instructions, and we can't intercept the args...
    // Let's proxy the JSON.parse! The M3U8 string is NOT JSON... wait.
    // The previous memory dump showed that m3u8 string is definitely in memory.
    
    // Let's hook the WebAssembly memory directly and dump it every 100ms.
    window.wasmMemDumps = [];
    
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      const result = await origInstantiateStreaming(response, imports);
      
      setInterval(() => {
          if (result.instance && result.instance.exports.memory) {
              const mem = new Uint8Array(result.instance.exports.memory.buffer);
              // search for M3U8
              const target = 'playlist.m3u8';
              for (let i = 0; i < mem.length - target.length; i++) {
                  let match = true;
                  for (let j = 0; j < target.length; j++) {
                      if (mem[i+j] !== target.charCodeAt(j)) { match = false; break; }
                  }
                  if (match) {
                      console.log('FOUND M3U8 AT OFFSET ' + i + ' AT TIME ' + Date.now());
                      break;
                  }
              }
          }
      }, 100);
      
      return result;
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
