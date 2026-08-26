fetch('https://strmd.b-cdn.net/js/bundle-jw.js')
    .then(r => r.text())
    .then(js => {
        let wasmM = js.match(/[a-zA-Z0-9_-]+\.wasm/);
        console.log("WASM file match:", wasmM ? wasmM[0] : "None");
        let wasmI = js.indexOf('WebAssembly');
        console.log("WebAssembly found at:", wasmI);
    })
    .catch(console.error);
