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

fakeWindow.jwplayer = () => ({ setup: (c) => { fakeWindow.extractedM3u8 = c.file; } });
fakeWindow.Clappr = { Player: class { constructor(c) { fakeWindow.extractedM3u8 = c.source; } } };

global.window = fakeWindow;
global.document = fakeWindow.document;
global.location = fakeWindow.location;
Object.defineProperty(global, 'navigator', { value: fakeWindow.navigator, writable: true, configurable: true });
global.jwplayer = fakeWindow.jwplayer;
global.Clappr = fakeWindow.Clappr;
global.self = fakeWindow;

global.fetch = async (url, opts) => {
    console.log('Sending fetch to', url);
    if (url.includes('/fetch')) {
      const fullUrl = url.startsWith('/') ? 'https://embed.st' + url : url;
      const headers = opts && opts.headers ? Object.fromEntries(opts.headers) : {};
      headers['Referer'] = 'https://streamed.pk/';
      
      const res = await fetch(fullUrl, { method: opts.method || 'GET', body: opts.body, headers });
      return res;
    }
    return fetch(url, opts);
};

async function run() {
  const lock = await import('./lock_patched.mjs');
  const init = lock.default;
  
  const wasmBuf = fs.readFileSync('lock.wasm');
  await init(wasmBuf);
  console.log('WASM Initialized!');
  
  if (lock.rMpGXU9) lock.rMpGXU9('https://embed.st/embed/admin/admin-tennis-channel/1');
  
  setTimeout(() => {
    console.log('--- FINAL M3U8 ---');
    console.log(fakeWindow.extractedM3u8);
    process.exit(0);
  }, 3000);
}
run();
