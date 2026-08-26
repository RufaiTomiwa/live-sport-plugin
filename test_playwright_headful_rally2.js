const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: false }); 
  const page = await browser.newPage();
  
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('analytics')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  page.on('console', msg => {
      if(!msg.text().includes('font')) {
        console.log('BROWSER:', msg.text())
      }
  });

  await page.addInitScript(() => {
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
        console.log("WASM INSTANTIATE STREAMING CALLED!", response.url);
        
        const result = await origInstantiateStreaming(response, imports);
        window.wasmInstance = result.instance;
        
        setInterval(() => {
            if (window.wasmInstance && window.wasmInstance.exports && window.wasmInstance.exports.memory && !window.decryptedM3u8) {
                const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                const str = new TextDecoder().decode(mem);
                if (str.includes('m3u8')) {
                    const idx = str.indexOf('m3u8');
                    const startIdx = str.lastIndexOf('https://', idx);
                    if (startIdx !== -1) {
                        const endIdx = str.indexOf('"', idx);
                        const endIdx2 = str.indexOf('\n', idx);
                        const endIdx3 = str.indexOf('\0', idx);
                        
                        let minEnd = Math.min(endIdx > -1 ? endIdx : Infinity, 
                                            endIdx2 > -1 ? endIdx2 : Infinity, 
                                            endIdx3 > -1 ? endIdx3 : Infinity);
                                            
                        if (minEnd !== Infinity) {
                            window.decryptedM3u8 = str.substring(startIdx, minEnd);
                            console.log("FOUND_M3U8:", window.decryptedM3u8);
                        }
                    }
                }
            }
        }, 100);
        
        return result;
    };
  });

  console.log("Going to embed.st...");
  await page.goto('https://embed.st/embed/admin/admin-rally-tv/1', { referer: 'https://streamed.pk/' });
  
  // Wait up to 30 seconds for Cloudflare and WASM execution
  for (let i = 0; i < 300; i++) {
      await page.waitForTimeout(100);
      let extractedM3u8 = await page.evaluate(() => window.decryptedM3u8);
      if (extractedM3u8) {
          console.log("Found:", extractedM3u8);
          break;
      }
  }
  
  await browser.close();
})();
