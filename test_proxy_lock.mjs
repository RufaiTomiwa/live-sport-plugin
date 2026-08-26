import * as lock from './lock.js';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function run() {
    global.window = {
        location: { host: "embed.st", hostname: "embed.st", protocol: "https:", href: "https://embed.st/embed/admin/admin-tennis-channel/1", origin: "https://embed.st" },
        localStorage: { getItem: () => null, setItem: () => {} },
        btoa: (s) => Buffer.from(s).toString('base64'),
        atob: (s) => Buffer.from(s, 'base64').toString('utf8'),
        navigator: { userAgent: "Mozilla/5.0" },
        document: { querySelectorAll: () => [], createElement: () => ({}), body: { appendChild: () => {} }, querySelector: () => null, getElementById: () => null },
        crypto: require('crypto').webcrypto, 
        performance: { now: () => Date.now() }
    };
    global.self = global.window;
    global.document = global.window.document;
    Object.defineProperty(global, "navigator", {
        value: global.window.navigator,
        configurable: true
    });
    
    global.fetch = async (url, opts) => {
        console.log("FETCH CALLED!", url, opts);
        return { 
            ok: true, 
            status: 200, 
            headers: new Map(),
            clone: function() { return this; },
            arrayBuffer: async () => new ArrayBuffer(0), 
            json: async () => ({}), 
            text: async () => "" 
        };
    };

    const origInstantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(buffer, imports) {
        if (buffer) {
            const wbg = imports['./locked_bg.js'];
            for (const funcName in wbg) {
                if (typeof wbg[funcName] === 'function') {
                    const orig = wbg[funcName];
                    wbg[funcName] = function(...args) {
                        try {
                            return orig.apply(this, args);
                        } catch (e) {
                            console.log("CRASH INSIDE JS IMPORT:", funcName, e);
                            if (e && e.stack) console.log(e.stack);
                            throw e;
                        }
                    }
                }
            }
            let res = await origInstantiate(buffer, imports);
            global.myWasmInstance = res;
            return res;
        } else {
            return await origInstantiate(buffer, imports);
        }
    };

    const buf = fs.readFileSync('lock2.wasm');
    await lock.default({ module_or_path: buf }); 
}

run().then(() => {
    lock.set_stream_jw("https://embed.st", "admin", "admin-tennis-channel/1")
        .catch(e => {});
});
