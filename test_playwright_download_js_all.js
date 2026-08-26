const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async res => {
      const url = res.url();
      if (url.includes('.js')) {
          console.log('Got JS file:', url);
          try {
              const text = await res.text();
              const name = url.split('/').pop();
              fs.writeFileSync(name.split('?')[0], text);
              console.log('Saved', name);
          } catch(e) {}
      }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(4000);
  
  await browser.close();
})();
