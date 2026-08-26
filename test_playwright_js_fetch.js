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

  let goatHeader = null;
  let payloadBytes = null;

  page.on('response', async res => {
      if (res.url().includes('/fetch')) {
          goatHeader = res.headers()['goat'];
          payloadBytes = await res.body();
          console.log('Intercepted /fetch! Goat:', goatHeader);
      }
  });

  await page.addInitScript(() => {
    // Override window.fetch entirely to capture the exact ArrayBuffer it returns
    // AND to see what the JS passes to the WASM!
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        console.log('FETCH INTERCEPTED:', args[0]);
        const res = await origFetch(...args);
        
        // Return a proxy that intercepts ArrayBuffer
        return new Proxy(res, {
            get(target, prop) {
                if (prop === 'arrayBuffer') {
                    return async function() {
                        const buf = await target.arrayBuffer();
                        console.log('ARRAYBUFFER LENGTH:', buf.byteLength);
                        
                        // Dump it to global
                        window.fetchPayloadBuf = Array.from(new Uint8Array(buf));
                        
                        return buf;
                    }
                }
                const val = target[prop];
                return typeof val === 'function' ? val.bind(target) : val;
            }
        });
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  const payloadBuf = await page.evaluate(() => window.fetchPayloadBuf);
  if (payloadBuf) {
      console.log('Payload from JS window:', payloadBuf.length);
      fs.writeFileSync('fetch_payload_js.bin', Buffer.from(payloadBuf));
  }

  await browser.close();
})();
