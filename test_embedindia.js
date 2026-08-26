fetch('https://embedindia.st/embed-noads/rally-tv', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => {
    console.log("Headers:");
    r.headers.forEach((v, k) => console.log(k, v));
}).catch(console.error);
