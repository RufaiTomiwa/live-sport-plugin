const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    const origFetch = window.fetch;
    window.fetch = async function(url, opts) {
      console.log('HOOKED FETCH:', url);
      return origFetch.apply(this, arguments);
    };
  });

  page.on('console', msg => console.log('PAGE:', msg.text()));

  await page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', { waitUntil: 'networkidle' });
  await browser.close();
})();
