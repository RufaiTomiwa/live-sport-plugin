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
        if (window.wasmInstance && window.wasmInstance.exports && window.wasmInstance.exports.memory) {
          const str = new TextDecoder().decode(new Uint8Array(window.wasmInstance.exports.memory.buffer));
          if (str.includes('m3u8')) {
            console.log('M3U8 IN MEM');
            const idx = str.indexOf('m3u8');
            const s = str.lastIndexOf('https://', idx);
            console.log('start idx:', s, 'end search at:', idx);
            if (s !== -1) {
              const candidates = [str.indexOf('"', idx), str.indexOf('\n', idx), str.indexOf('\0', idx)].filter(x => x > -1);
              console.log('candidates:', JSON.stringify(candidates));
              if (candidates.length > 0) {
                const url = str.substring(s, Math.min(...candidates));
                console.log('URL:', url);
                window.decryptedM3u8 = url;
              }
            }
          }
        }
      }, 500);
      return result;
    };
  });
  
  page.on('console', m => { if (!m.text().includes('font') && !m.text().includes('sfntVersion') && !m.text().includes('404')) console.error('B:', m.text()); });
  
  await page.goto('https://embed.st/embed/admin/admin-rally-tv/1', { referer: 'https://streamed.pk/' });
  
  await new Promise(r => setTimeout(r, 20000));
  
  const url = await page.evaluate(() => window.decryptedM3u8);
  if (url) {
    console.log('RESULT:', url);
  } else {
    console.log('NO RESULT - dumping debug info...');
    const hasWasm = await page.evaluate(() => !!window.wasmInstance);
    console.log('Has wasm:', hasWasm);
  }
  
  await browser.close();
})();
