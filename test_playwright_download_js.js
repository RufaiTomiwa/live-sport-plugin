const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async res => {
      const url = res.url();
      if (url.includes('locked_bg.js') || url.includes('locked.js')) {
          console.log('Got JS glue file:', url);
          const text = await res.text();
          const name = url.split('/').pop();
          fs.writeFileSync(name, text);
      }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
