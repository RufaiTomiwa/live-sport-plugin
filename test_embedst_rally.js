const EmbedStProvider = require('./src/providers/EmbedStProvider');
async function test() {
    const p = new EmbedStProvider({ 
        proxyFetch: async (url, opts) => {
            return await fetch(url, opts);
        },
        circuitBreaker: { wrap: (n, f) => ({ fire: f }) }
    });
    
    console.log("Testing Rally TV...");
    const streams = await p.resolveStream('https://embed.st/embed/admin/admin-rally-tv/1', 'motor-sports', 'Rally TV', {});
    console.log("Result:");
    console.dir(streams, { depth: null });
}
test();
