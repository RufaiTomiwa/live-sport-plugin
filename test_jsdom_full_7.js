const { JSDOM, VirtualConsole } = require('jsdom');
const axios = require('axios');

async function run() {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (e) => { /* ignore */ });
  virtualConsole.on("jsdomError", (e) => { console.error('JSDOM Error:', e); });
  virtualConsole.on("log", (msg) => { console.log('Log:', msg); });
  
  const html = '<html lang="en"><body><div id="player"></div><script src="https://strmd.b-cdn.net/js/bundle-jw.js"></script></body></html>';
  
  let extractedM3u8 = null;

  const dom = new JSDOM(html, {
    url: 'https://embed.st/embed/admin/admin-tennis-channel/1',
    referrer: 'https://streamed.pk/',
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole,
    beforeParse(window) {
      if (!window.performance) window.performance = {};
      window.performance.timing = { navigationStart: Date.now() };
      
      window.fetch = async (url, opts) => {
        console.log('[Window.Fetch] Hooked:', url);
        if (url.includes('/fetch')) {
          const fullUrl = url.startsWith('/') ? 'https://embed.st' + url : url;
          const headers = opts && opts.headers ? Object.fromEntries(opts.headers) : {};
          headers['Referer'] = 'https://streamed.pk/';
          const res = await axios(fullUrl, { method: opts.method || 'GET', data: opts.body, headers, responseType: 'arraybuffer' });
          return { ok: true, arrayBuffer: async () => res.data };
        }
        
        const fetchMod = await import('node-fetch');
        return fetchMod.default(url, opts);
      };

      window.jwplayer = () => ({
        setup: (c) => { 
          console.log('[JWPlayer] Setup called with file:', c.file);
          extractedM3u8 = c.file; 
        }
      });
      
      window.Clappr = { 
        Player: class { 
          constructor(c) { 
            console.log('[Clappr] Setup called with file:', c.source);
            extractedM3u8 = c.source; 
          } 
        } 
      };
    }
  });
  
  setTimeout(() => {
    console.log('--- FINAL M3U8 ---');
    console.log(extractedM3u8);
    process.exit(0);
  }, 8000);
}
run();
