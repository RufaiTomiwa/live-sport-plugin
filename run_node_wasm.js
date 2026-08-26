const fs = require('fs');

async function run() {
    const wasmBuffer = fs.readFileSync('lock.wasm');
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    
    const imports = {
        './locked_bg.js': {}
    };
    
    try {
        const instance = await WebAssembly.instantiate(wasmModule, imports);
    } catch (e) {
        console.log(e.message);
    }
}
run();
