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
    // If the data is being parsed, we could also just decompile lock.wasm with wasm2wat.
    // Let's hook fetch to intercept lock.wasm and save it to a variable, then export it!
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        const res = await origFetch.apply(this, args);
        if (args[0].includes('lock.wasm')) {
            const resClone = res.clone();
            const buf = await resClone.arrayBuffer();
            window.lockWasmBytes = Array.from(new Uint8Array(buf));
        }
        return res;
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  const wasm = await page.evaluate(() => window.lockWasmBytes);
  if (wasm) {
      fs.writeFileSync('lock.wasm', Buffer.from(wasm));
      console.log('Saved lock.wasm!');
  } else {
      console.log('NO WASM FOUND');
  }

  await browser.close();
})();
