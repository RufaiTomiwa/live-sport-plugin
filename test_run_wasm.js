const { get_stream_url } = require('./src/providers/run_wasm_native.js');
async function run() {
    try {
        console.log("Testing Sky Sports...");
        const url = await get_stream_url("https://embed.st", "admin", "admin-sky-sports-main-event/1");
        console.log("RESULT:", url);
    } catch(e) {
        console.error("ERROR:", e);
    }
}
run();
