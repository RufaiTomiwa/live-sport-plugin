// Recon script — intercept ALL network traffic on embed.st to find
// the actual encrypted payload that feeds the WASM decryptor.
// Goal: find an API call we can replicate in pure Node.js.

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const TARGET = process.argv[2] || 'https://embed.st/embed/admin/admin-rally-tv/1';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const requests = [];
  const responses = [];

  // Capture every outgoing request
  page.on('request', req => {
    const url = req.url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('fonts.g')) return;
    requests.push({ url, method: req.method(), headers: req.headers() });
  });

  // Capture every response body that looks interesting
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('google') || url.includes('doubleclick') || url.includes('fonts.g')) return;
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('json') || ct.includes('javascript') || ct.includes('text')) {
      try {
        const body = await res.text();
        responses.push({ url, status: res.status(), ct, body: body.slice(0, 1000) });
      } catch {}
    } else {
      responses.push({ url, status: res.status(), ct, body: '[binary]' });
    }
  });

  // Hook the WASM to log what inputs go into it
  await page.addInitScript(() => {
    const origInstantiate = WebAssembly.instantiate;
    const origInstantiateStreaming = WebAssembly.instantiateStreaming;

    function hookInstance(instance) {
      const exports = instance.exports;
      window.__wasmExports__ = Object.keys(exports);
      // Try calling set_stream_jw or similar with logging
      window.__wasmInstance__ = instance;
    }

    WebAssembly.instantiate = async function(bufferOrModule, imports) {
      console.log('WA.instantiate called');
      const result = await origInstantiate(bufferOrModule, imports);
      hookInstance(result.instance);
      return result;
    };

    WebAssembly.instantiateStreaming = async function(response, imports) {
      console.log('WA.instantiateStreaming called, url:', response.url || '?');
      const result = await origInstantiateStreaming(response, imports);
      hookInstance(result.instance);

      // Dump memory after 2 seconds
      setTimeout(() => {
        try {
          const mem = new Uint8Array(result.instance.exports.memory.buffer);
          const str = new TextDecoder().decode(mem);
          // Find ALL https URLs in memory
          const urls = [];
          let pos = 0;
          while (true) {
            const idx = str.indexOf('https://', pos);
            if (idx === -1) break;
            const end = Math.min(
              ...[str.indexOf(' ', idx), str.indexOf('\n', idx), str.indexOf('\0', idx), str.indexOf('"', idx)].filter(x => x > -1)
            );
            if (end > idx) {
              urls.push(str.substring(idx, end));
            }
            pos = idx + 1;
          }
          // Log up to first 30
          urls.slice(0, 30).forEach(u => console.log('MEM_URL:', u));
          console.log('WASM_EXPORTS:', JSON.stringify(window.__wasmExports__));
        } catch(e) {
          console.log('MEM_DUMP_ERR:', e.message);
        }
      }, 3000);

      return result;
    };

    // Patch fetch to log calls
    const origFetch = window.fetch;
    window.fetch = function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (!url?.includes('google') && !url?.includes('doubleclick')) {
        console.log('FETCH:', url);
      }
      return origFetch.apply(this, args);
    };

    // Patch XMLHttpRequest to log calls
    const origXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (!url?.includes('google')) {
        console.log('XHR:', method, url);
      }
      return origXHROpen.apply(this, arguments);
    };
  });

  const logLines = [];
  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('font') || txt.includes('sfntVersion') || txt.includes('404') || txt.includes('ERR_FAILED')) return;
    logLines.push(txt);
    process.stdout.write('  CONSOLE: ' + txt + '\n');
  });

  console.log('\n=== FETCHING:', TARGET, '===\n');
  await page.goto(TARGET, { referer: 'https://streamed.pk/' });
  await page.waitForTimeout(8000);

  console.log('\n=== ALL NETWORK REQUESTS ===');
  requests.forEach(r => console.log(`  [${r.method}] ${r.url}`));

  console.log('\n=== INTERESTING RESPONSES ===');
  responses
    .filter(r => !r.url.includes('wasm') && !r.url.includes('.png') && !r.url.includes('.ico'))
    .forEach(r => {
      console.log(`\n  [${r.status}] ${r.url}`);
      console.log(`  CT: ${r.ct}`);
      console.log(`  BODY: ${r.body.slice(0, 300)}`);
    });

  await browser.close();
})();
