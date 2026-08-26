const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('response', resp => {
    console.log('[RESP]', resp.status(), resp.url());
  });

  console.log('Navigating...');
  await page.goto('https://embedindia.st/embed-noads/rally-tv', { waitUntil: 'networkidle' });
  console.log('Title:', await page.title());
  await browser.close();
})();
