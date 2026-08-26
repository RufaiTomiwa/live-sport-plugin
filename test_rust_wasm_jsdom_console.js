const { JSDOM, VirtualConsole } = require('jsdom');
const axios = require('axios');
const fs = require('fs');

async function run() {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', (e) => console.error('JSDOM Error:', e));
  virtualConsole.on('log', (msg) => console.log('JSDOM Log:', msg));
  
  const dom = new JSDOM('<html lang="en"><body><div id="player"></div></body></html>', {
    url: 'https://embed.st/embed/admin/admin-tennis-channel/1',
    referrer: 'https://streamed.pk/',
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole
  });

  dom.window.fetch = async (url, opts) => {
    console.log('JSDOM fetch:', url);
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
  
  dom.window.extractedM3u8 = null;
  dom.window.jwplayer = () => ({ setup: (c) => { dom.window.extractedM3u8 = c.file; } });
  dom.window.Clappr = { Player: class { constructor(c) { dom.window.extractedM3u8 = c.source; } } };

  const r = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.js');
  let js = r.data.replace(/export default[^;]+;/g, '');
  js = js.replace(/export \{[^}]+\};/g, '');
  js = js.replace(/import\.meta\.url/g, '"https://strmd.b-cdn.net/js/wasm/lock.js"');
  
  dom.window.eval(js);
  console.log('Evaluated JS!');
  
  const wasmRes = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
  await dom.window.wasm_bindgen(wasmRes.data);
  console.log('WASM Initialized in JSDOM!');
  
  dom.window.wasm_bindgen.init_wasm();
  console.log('init_wasm called!');
  
  setTimeout(() => {
    console.log('Resulting M3U8:', dom.window.extractedM3u8);
    process.exit(0);
  }, 2000);
}
run();
