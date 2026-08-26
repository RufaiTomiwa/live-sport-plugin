import * as lock from './lock.js';
import fs from 'fs';

async function run() {
    try {
        global.window = {
            location: { host: "embed.st" },
            localStorage: { getItem: () => null, setItem: () => {} },
            btoa: (s) => Buffer.from(s).toString('base64'),
            atob: (s) => Buffer.from(s, 'base64').toString('utf8'),
        };
        global.document = {
            querySelectorAll: () => []
        };
        global.fetch = async (url, opts) => {
            console.log("FETCH URL:", url);
            console.log("FETCH OPTS:", opts);
            return {
                ok: true,
                status: 200,
                arrayBuffer: async () => new ArrayBuffer(0),
                json: async () => ({}),
                text: async () => ""
            };
        };
        
        const buf = fs.readFileSync('lock2.wasm');
        await lock.default({ module_or_path: buf }); 
        console.log("WASM loaded!");
        
        // Wait, on the live site, they DO pass dmin-tennis-channel/1.
        // Are the first 2 arguments wrong?
        // Let's trace Playwright from yesterday and see exactly what arguments set_stream is called with.
    } catch(e) {
        console.error("FAILED:", e);
    }
}
run();
