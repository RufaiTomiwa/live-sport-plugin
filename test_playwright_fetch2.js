const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async response => {
    if (response.url().includes('/fetch')) {
      console.log('FETCH RESPONSE HEADERS:', response.headers());
      const buf = await response.body();
      console.log('FETCH RESPONSE HEX:', buf.toString('hex'));
      console.log('FETCH RESPONSE LENGTH:', buf.length);
    }
  });

  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('analytics')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
