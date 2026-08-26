const fs = require('fs');
const axios = require('axios');

async function testRustWasm() {
  const r = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.js');
  let lockJs = r.data.replace(/import\.meta\.url/g, '"https://strmd.b-cdn.net/js/wasm/lock.js"');
  
  global.window = global;
  global.document = {
    createElement: () => ({ setAttribute: () => {} }),
    querySelector: () => ({ src: 'https://strmd.b-cdn.net/js/wasm/lock.wasm' }),
    getElementById: () => ({ remove: () => {} }),
    body: { appendChild: () => {} }
  };
  global.location = { href: 'https://embed.st/embed/admin/admin-tennis-channel/1', origin: 'https://embed.st' };
  global.navigator = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
  
  global.fetch = async (url, opts) => {
    if (url.includes('lock.wasm')) {
      const wasmRes = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
      return { ok: true, headers: new Map([['content-type', 'application/wasm']]), arrayBuffer: async () => wasmRes.data };
    }
    if (url.includes('/fetch')) {
      const fullUrl = url.startsWith('/') ? 'https://embed.st' + url : url;
      const headers = opts && opts.headers ? Object.fromEntries(opts.headers) : {};
      headers['Referer'] = 'https://streamed.pk/';
      const res = await axios(fullUrl, {
        method: (opts && opts.method) || 'GET',
        data: (opts && opts.body) || undefined,
        headers: headers,
        responseType: 'arraybuffer'
      });
      return { ok: true, arrayBuffer: async () => res.data };
    }
    throw new Error('Unknown fetch: ' + url);
  };
  
  let extractedM3u8 = null;
  global.jwplayer = () => ({ setup: (c) => { extractedM3u8 = c.file; } });
  global.Clappr = { Player: class { constructor(c) { extractedM3u8 = c.source; } } };
  
  eval(lockJs);
  
  try {
    const wasmRes = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
    await window.wasm_bindgen(wasmRes.data);
    console.log('WASM Initialized!');
    
    if (window.wasm_bindgen.init_wasm) {
        window.wasm_bindgen.init_wasm();
    } else {
        console.log('No init_wasm export found in wasm_bindgen wrapper');
    }
    
    setTimeout(() => {
        console.log('Resulting M3U8:', extractedM3u8);
    }, 2000);
    
  } catch (e) {
    console.error('WASM run error:', e.message);
  }
}
testRustWasm();
