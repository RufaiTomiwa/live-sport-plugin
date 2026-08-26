const { JSDOM } = require('jsdom');
const axios = require('axios');
const fs = require('fs');

async function run() {
  const dom = new JSDOM('<html lang="en"><body><div id="player"></div></body></html>', {
    url: 'https://embed.st/embed/admin/admin-tennis-channel/1',
    referrer: 'https://streamed.pk/',
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(window) {
      window.fetch = async (url, opts) => {
        if (url.includes('lock.wasm')) {
          const res = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
          return { ok: true, headers: new Map([['content-type', 'application/wasm']]), arrayBuffer: async () => res.data };
        }
        if (url.includes('/fetch')) {
          const fullUrl = url.startsWith('/') ? 'https://embed.st' + url : url;
          const headers = opts && opts.headers ? Object.fromEntries(opts.headers) : {};
          headers['Referer'] = 'https://streamed.pk/';
          const res = await axios(fullUrl, { method: opts.method || 'GET', data: opts.body, headers, responseType: 'arraybuffer' });
          return { ok: true, arrayBuffer: async () => res.data };
        }
        throw new Error('Unknown fetch: ' + url);
      };
      
      window.extractedM3u8 = null;
      window.jwplayer = () => ({ setup: (c) => { window.extractedM3u8 = c.file; } });
      window.Clappr = { Player: class { constructor(c) { window.extractedM3u8 = c.source; } } };
    }
  });

  const r = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.js');
  let js = r.data.replace(/export default[^;]+;/g, '');
  js = js.replace(/export \{[^}]+\};/g, '');
  js = js.replace(/import\.meta\.url/g, '"https://strmd.b-cdn.net/js/wasm/lock.js"');
  
  dom.window.eval(js);
  
  const wasmRes = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
  await dom.window.wasm_bindgen(wasmRes.data);
  console.log('WASM Initialized in JSDOM!');
  
  dom.window.wasm_bindgen.init_wasm();
  
  setTimeout(() => {
    console.log('Resulting M3U8:', dom.window.extractedM3u8);
  }, 2000);
}
run();
