const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    const orig = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      console.log('WASM HOOK FIRED');
      const result = await orig(response, imports);
      window.wasmInstance = result.instance;
      setInterval(() => {
        if (window.wasmInstance && window.wasmInstance.exports && window.wasmInstance.exports.memory && !window.decryptedM3u8) {
          const str = new TextDecoder().decode(new Uint8Array(window.wasmInstance.exports.memory.buffer));
          if (str.includes('m3u8')) {
            const idx = str.indexOf('m3u8');
            const s = str.lastIndexOf('https://', idx);
            if (s !== -1) {
              const end = Math.min(...[str.indexOf('"', idx), str.indexOf('\n', idx), str.indexOf('\0', idx)].filter(x => x > -1));
              window.decryptedM3u8 = str.substring(s, end);
              console.log('FOUND M3U8');
            }
          }
        }
      }, 100);
      return result;
    };
  });
  
  page.on('console', m => { if (!m.text().includes('font')) console.error('B:', m.text()); });
  
  await page.goto('https://embed.st/embed/admin/admin-rally-tv/1', { referer: 'https://streamed.pk/' });
  
  try {
    await page.waitForFunction(() => !!window.decryptedM3u8, { timeout: 25000 });
    const url = await page.evaluate(() => window.decryptedM3u8);
    console.log('RESULT:', url);
  } catch(e) {
    console.error('TIMEOUT - no url found');
  }
  
  await browser.close();
})();
