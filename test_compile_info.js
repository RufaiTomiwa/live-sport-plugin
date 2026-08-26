const fs = require('fs');

async function run() {
    const wasmBuffer = fs.readFileSync('lock2.wasm');
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(wasmModule, {
        './locked_bg.js': new Proxy({}, {
            get(target, prop) {
                return function(...args) {
                    console.log('Called:', prop, args);
                    return 0;
                }
            }
        })
    });
    
    // Malloc crashed. In older wasm-bindgen, if malloc is used, we have to initialize __wbindgen_start?
    // Let's use Playwright one more time, but this time run our decryption scan in PLAYWRIGHT memory IMMEDIATELY AFTER FETCH?
    // Wait, LO said: "I dont want to use playwright use how the things are curretnly working do webassem shits you know you did it earlier right ?"
    // LO wants a script that uses native 
ode-fetch and native WASM without Playwright.
}
run();
