const { JSDOM, VirtualConsole } = require('jsdom');
const axios = require('axios');

async function run() {
  const dom = new JSDOM('<html lang="en"><body><div id="player"></div></body></html>', {
    url: 'https://embed.st/embed/admin/admin-tennis-channel/1',
    referrer: 'https://streamed.pk/',
    runScripts: 'dangerously',
    resources: 'usable'
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
  let js = r.data;
  
  // 1. Remove default export
  js = js.replace(/export\s+default\s+[^;]+;/g, '');
  
  // 2. Remove export brackets
  js = js.replace(/export\s+\{[^}]+\};/g, '');
  
  // 3. Just remove the word "export" so "export function foo" becomes "function foo"
  js = js.replace(/export\s+function/g, 'window.init_wasm = function'); // Wait, all of them? No.
  js = js.replace(/export\s+/g, '');
  
  // 4. Patch import.meta
  js = js.replace(/import\.meta/g, '({url: "https://strmd.b-cdn.net/js/wasm/lock.js"})');
  
  dom.window.eval(js);
  
  const wasmRes = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
  // The module initializes default into wasm_bindgen usually if we look at regular lock.js
  // Let's just bind all functions to window
  dom.window.eval('window.init_wasm = init_wasm;');
  dom.window.eval('window.wasm_bindgen = init;');
  
  await dom.window.wasm_bindgen(wasmRes.data);
  console.log('WASM Init ok!');
  
  dom.window.init_wasm();
  
  setTimeout(() => {
    console.log('--- FINAL M3U8 ---');
    console.log(dom.window.extractedM3u8);
    process.exit(0);
  }, 4000);
}
run();
