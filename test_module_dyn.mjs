import fetch from 'node-fetch'; 
import fs from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<html lang="en"><body><div id="player"></div></body></html>', {
  url: 'https://embed.st/embed/admin/admin-tennis-channel/1',
  referrer: 'https://streamed.pk/'
});

global.window = dom.window;
global.document = dom.window.document;
global.location = dom.window.location;

Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true
});

global.fetch = async (url, opts) => {
    if (url.includes('/fetch')) {
      const fullUrl = url.startsWith('/') ? 'https://embed.st' + url : url;
      const headers = opts && opts.headers ? Object.fromEntries(opts.headers) : {};
      headers['Referer'] = 'https://streamed.pk/';
      
      console.log('Sending fetch to', fullUrl);
      const res = await fetch(fullUrl, { method: opts.method || 'GET', body: opts.body, headers });
      return res;
    }
    throw new Error('Unknown fetch: ' + url);
};

let extractedM3u8 = null;
global.jwplayer = () => ({ setup: (c) => { extractedM3u8 = c.file; } });
global.Clappr = { Player: class { constructor(c) { extractedM3u8 = c.source; } } };
dom.window.jwplayer = global.jwplayer;
dom.window.Clappr = global.Clappr;

async function run() {
  // Dynamically import so globals are set FIRST
  const lock = await import('./lock.mjs');
  const init = lock.default;
  const init_wasm = lock.init_wasm;

  const wasmBuf = fs.readFileSync('lock.wasm');
  await init(wasmBuf);
  console.log('WASM Initialized!');
  
  init_wasm();
  
  setTimeout(() => {
    console.log('--- FINAL M3U8 ---');
    console.log(extractedM3u8);
    process.exit(0);
  }, 3000);
}
run();
