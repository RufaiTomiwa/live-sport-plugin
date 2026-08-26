const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');

async function run() {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("log", (msg, a, b, c) => { console.log('Log:', msg, a||'', b||'', c||''); });
  
  let bundle = fs.readFileSync('bundle-jw-print.js', 'utf8');

  const html = '<html lang="en"><body><div id="player"></div><script>' + bundle + '</script></body></html>';
  
  const dom = new JSDOM(html, {
    url: 'https://embed.st/embed/admin/admin-tennis-channel/1',
    referrer: 'https://streamed.pk/',
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole,
    beforeParse(window) {
      if (!window.performance) window.performance = {};
      window.performance.timing = { navigationStart: Date.now() };
      
      Object.defineProperty(window, 'outerWidth', { value: 1920 });
      Object.defineProperty(window, 'innerWidth', { value: 1920 });
      Object.defineProperty(window, 'outerHeight', { value: 1080 });
      Object.defineProperty(window, 'innerHeight', { value: 1080 });
      Object.defineProperty(window.navigator, 'webdriver', { value: false });
    }
  });
}
run();
