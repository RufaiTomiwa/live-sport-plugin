const fs = require('fs');
const js = fs.readFileSync('bundle-jw.js', 'utf8');

global.window = global;
global.self = global;
global.document = {
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
    body: { appendChild: () => {}, style: {} },
    location: { hash: '' },
    querySelector: () => null,
    getElementById: () => null
};
global.location = { protocol: 'https:', host: 'assets.embedindia.st', pathname: '/embed-noads/rally-tv' };
global.URLSearchParams = class { get() { return 'jw'; } };
global.navigator = { userAgent: 'Mozilla/5.0' };
global.XMLHttpRequest = class {
    open() {}
    send() {}
};

let wasmCalled = false;
const ProxyWA = new Proxy(WebAssembly, {
    get: function(target, prop) {
        wasmCalled = true;
        console.log("WebAssembly property accessed:", prop);
        return target[prop];
    }
});
global.WebAssembly = ProxyWA;

try {
    eval(js);
} catch (e) {
    console.error("Eval error:", e.message);
}

setTimeout(() => {
    console.log("WASM Called:", wasmCalled);
}, 1000);
