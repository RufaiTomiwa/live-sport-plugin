import fetch from 'node-fetch'; 
import fs from 'fs';

const fakeWindow = {
  document: {
    createElement: () => ({ setAttribute: () => {} }),
    querySelector: () => ({ src: 'https://strmd.b-cdn.net/js/wasm/lock.wasm' }),
    getElementById: () => ({ remove: () => {} }),
    body: { appendChild: () => {} }
  },
  location: { href: 'https://embed.st/embed/admin/admin-tennis-channel/1', origin: 'https://embed.st', hostname: 'embed.st' },
  navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  extractedM3u8: null
};

fakeWindow.jwplayer = () => ({ setup: (c) => { console.log('jwplayer setup:', c); fakeWindow.extractedM3u8 = c.file; } });
fakeWindow.Clappr = { Player: class { constructor(c) { console.log('clappr setup:', c); fakeWindow.extractedM3u8 = c.source; } } };

fakeWindow.fetch = async (url, opts) => {
    console.log('[fakeWindow.fetch] Sending fetch to', url);
    if (url.includes('/fetch')) {
      const fullUrl = url.startsWith('/') ? 'https://embed.st' + url : url;
      const headers = opts && opts.headers ? Object.fromEntries(opts.headers) : {};
      headers['Referer'] = 'https://streamed.pk/';
      
      const res = await fetch(fullUrl, { method: opts.method || 'GET', body: opts.body, headers });
      console.log('Fetch response status:', res.status);
      const buf = await res.arrayBuffer();
      console.log('Fetch response length:', buf.byteLength);
      return { ok: true, arrayBuffer: async () => buf };
    }
    return fetch(url, opts);
};

global.window = fakeWindow;
global.document = fakeWindow.document;
global.location = fakeWindow.location;
Object.defineProperty(global, 'navigator', { value: fakeWindow.navigator, writable: true, configurable: true });
global.jwplayer = fakeWindow.jwplayer;
global.Clappr = fakeWindow.Clappr;
global.self = fakeWindow;
global.fetch = fakeWindow.fetch;

async function run() {
  const lock = await import('./lock_patched.mjs');
  const init = lock.default;
  
  const wasmBuf = fs.readFileSync('lock.wasm');
  await init(wasmBuf);
  console.log('WASM Initialized!');
  
  try {
      if (lock.set_stream_jw) {
          console.log('Calling set_stream_jw');
          lock.set_stream_jw('https://embed.st/embed/admin/admin-tennis-channel/1');
      }
      if (lock.set_stream) {
          console.log('Calling set_stream');
          lock.set_stream('https://embed.st/embed/admin/admin-tennis-channel/1');
      }
  } catch (e) {
      console.error('set_stream error:', e);
  }
  
  setTimeout(() => {
    console.log('--- FINAL M3U8 ---');
    console.log(fakeWindow.extractedM3u8);
    process.exit(0);
  }, 3000);
}
run();
