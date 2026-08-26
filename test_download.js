const https = require('https');
const fs = require('fs');

https.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', (res) => {
    let chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => {
        fs.writeFileSync('lock_new.wasm', Buffer.concat(chunks));
        console.log("Saved lock_new.wasm, size:", Buffer.concat(chunks).byteLength);
    });
});
