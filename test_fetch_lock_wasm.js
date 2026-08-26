fetch('https://embed.st/lock.wasm')
    .then(r => r.arrayBuffer())
    .then(buf => {
        require('fs').writeFileSync('lock.wasm', Buffer.from(buf));
        console.log('Saved lock.wasm, size:', buf.byteLength);
    })
    .catch(console.error);
