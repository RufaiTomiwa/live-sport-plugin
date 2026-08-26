fetch('https://embedindia.st/embed/rally-tv', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Referer': 'https://embedindia.st/'
    }
})
.then(r => r.text())
.then(html => require('fs').writeFileSync('rally_embedindia.html', html))
.catch(console.error);
