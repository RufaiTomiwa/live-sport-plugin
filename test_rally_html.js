fetch('https://embed.st/embed/admin/admin-rally-tv/1', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => r.text()).then(html => {
    require('fs').writeFileSync('rally_tv_embed.html', html);
    console.log("Written. Size:", html.length);
}).catch(console.error);
