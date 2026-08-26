fetch('https://embed.st/embed/admin/admin-sky-sports-main-event/1')
    .then(r => r.text())
    .then(html => console.log(html))
    .catch(console.error);
