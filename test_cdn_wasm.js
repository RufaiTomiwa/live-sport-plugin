const https = require('https');
https.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', (res) => {
    console.log(res.statusCode);
    console.log(res.headers);
});
