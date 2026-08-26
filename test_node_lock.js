const fs = require('fs');

async function run() {
    const wasmCode = fs.readFileSync('lock2.wasm');
    
    // We need to implement all 70 imports for lock2.wasm in JS to see exactly what fails.
    // Wait, we HAVE lock.js which is the generated bindgen wrapper!
    // Why don't we just execute lock.js in Node?
}
run();
