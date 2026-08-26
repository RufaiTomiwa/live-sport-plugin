fetch('https://streamed.pk/api/stream/admin/admin-rally-tv', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => r.json()).then(data => {
    console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
