// Deep recon — capture the full request/response body of embedindia.st/fetch
// This is the POST that presumably returns the encrypted stream data the WASM decrypts.

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const TARGET = process.argv[2] || 'https://embed.st/embed/admin/admin-rally-tv/1';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture POST bodies to embedindia/fetch
  const fetchCalls = [];
  page.on('request', async req => {
    const url = req.url();
    if (url.includes('embedindia') || url.includes('cdn-lab') || url.includes('embed.st')) {
      const postData = req.postData();
      fetchCalls.push({
        method: req.method(),
        url,
        headers: req.headers(),
        body: postData || null
      });
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('embedindia') || url.includes('cdn-lab')) {
      try {
        const ct = res.headers()['content-type'] || '';
        let body;
        if (ct.includes('json')) {
          body = await res.json();
        } else {
          body = await res.text();
        }
        console.log(`\n=== RESPONSE [${res.status()}] ${url} ===`);
        console.log(JSON.stringify(body, null, 2).slice(0, 2000));
      } catch(e) {
        console.log(`=== RESPONSE [${res.status()}] ${url} === (parse error: ${e.message})`);
      }
    }
  });

  // Also hook fetch to capture what the WASM sends
  await page.addInitScript(() => {
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || 'unknown');
      const opts = args[1] || {};
      if (url.includes('embedindia') || url.includes('cdn-lab')) {
        console.log('FETCH_REQ:', url);
        console.log('FETCH_BODY:', JSON.stringify(opts.body || null));
        const res = await origFetch.apply(this, args);
        const clone = res.clone();
        try {
          const text = await clone.text();
          console.log('FETCH_RES:', text.slice(0, 500));
        } catch {}
        return res;
      }
      return origFetch.apply(this, args);
    };
  });

  page.on('console', msg => {
    const txt = msg.text();
    if (txt.startsWith('FETCH_REQ') || txt.startsWith('FETCH_BODY') || txt.startsWith('FETCH_RES')) {
      console.log('  ' + txt);
    }
  });

  await page.goto(TARGET, { referer: 'https://streamed.pk/' });
  await page.waitForTimeout(8000);

  console.log('\n\n=== ALL CAPTURED REQUESTS TO embedindia/cdn-lab ===');
  fetchCalls.forEach(r => {
    console.log(`\n[${r.method}] ${r.url}`);
    if (r.body) console.log('  BODY:', r.body.slice(0, 500));
    const interesting = Object.entries(r.headers)
      .filter(([k]) => ['cookie', 'authorization', 'x-', 'referer', 'origin'].some(p => k.toLowerCase().startsWith(p)));
    if (interesting.length) {
      console.log('  INTERESTING HEADERS:', JSON.stringify(Object.fromEntries(interesting)));
    }
  });

  await browser.close();
})();
