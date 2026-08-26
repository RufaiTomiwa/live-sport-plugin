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

  page.on('response', async res => {
      const url = res.url();
      if (url.includes('/fetch')) {
          console.log('Fetch URL:', url);
          console.log('Fetch response status:', res.status());
          try {
              const text = await res.text();
              console.log('Fetch response text length:', text.length);
          } catch(e) { }
      }
  });

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { referer: 'https://streamed.pk/' });
  
  await page.waitForTimeout(6000);
  
  await browser.close();
})();
