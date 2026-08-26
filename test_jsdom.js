const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const fs = require('fs');
const bundleJs = fs.readFileSync('bundle-jw.js', 'utf8');

const html = `<!DOCTYPE html>
<html>
<head></head>
<body>
<div id="player"></div>
<script>${bundleJs}</script>
</body>
</html>`;

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);

const dom = new JSDOM(html, {
  url: 'https://embedindia.st/embed-noads/rally-tv',
  runScripts: 'dangerously',
  virtualConsole
});

setTimeout(() => {
    console.log('Done waiting.');
}, 2000);
