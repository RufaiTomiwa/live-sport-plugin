const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
      console.log('BROWSER:', msg.text());
  });

  await page.addInitScript(() => {
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function(response, imports) {
      if (imports && imports['./locked_bg.js']) {
          console.log('KEYS FOR ./locked_bg.js:', Object.keys(imports['./locked_bg.js']).join(', '));
      }
      return origInstantiateStreaming(response, imports);
    };
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
