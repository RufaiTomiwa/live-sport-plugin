const fs = require('fs');

const run_wasm_native = `
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function extractM3U8(user, event, id, embedUrl) {
    if (!embedUrl) {
        embedUrl = \`https://embed.st/embed/\${user}/\${event}/\${id}\`;
    }

    const browser = await chromium.launch({ headless: true }); 
    try {
        const page = await browser.newPage();
        
        await page.route('**/*', route => {
            const url = route.request().url();
            if (url.includes('google') || url.includes('doubleclick') || url.includes('analytics')) {
                route.abort();
            } else {
                route.continue();
            }
        });

        await page.addInitScript(() => {
            const origInstantiateStreaming = WebAssembly.instantiateStreaming;
            WebAssembly.instantiateStreaming = async function(response, imports) {
                const result = await origInstantiateStreaming(response, imports);
                window.wasmInstance = result.instance;
                
                setInterval(() => {
                    if (window.wasmInstance && window.wasmInstance.exports && window.wasmInstance.exports.memory && !window.decryptedM3u8) {
                        const mem = new Uint8Array(window.wasmInstance.exports.memory.buffer);
                        const str = new TextDecoder().decode(mem);
                        if (str.includes('m3u8')) {
                            const idx = str.indexOf('m3u8');
                            const startIdx = str.lastIndexOf('https://', idx);
                            if (startIdx !== -1) {
                                const endIdx = str.indexOf('"', idx);
                                const endIdx2 = str.indexOf('\\n', idx);
                                const endIdx3 = str.indexOf('\\0', idx);
                                
                                let minEnd = Math.min(endIdx > -1 ? endIdx : Infinity, 
                                                    endIdx2 > -1 ? endIdx2 : Infinity, 
                                                    endIdx3 > -1 ? endIdx3 : Infinity);
                                                    
                                if (minEnd !== Infinity) {
                                    window.decryptedM3u8 = str.substring(startIdx, minEnd);
                                }
                            }
                        }
                    }
                }, 100);
                return result;
            };
        });

        let extractedM3u8 = null;
        
        await page.goto(embedUrl, { referer: 'https://streamed.pk/' });
        
        // Wait up to 30 seconds for Cloudflare and WASM execution
        for (let i = 0; i < 300; i++) {
            await page.waitForTimeout(100);
            extractedM3u8 = await page.evaluate(() => window.decryptedM3u8);
            if (extractedM3u8) {
                break;
            }
        }
        
        if (extractedM3u8) {
            console.log(extractedM3u8);
        } else {
            console.error("Failed to extract m3u8");
        }
    } catch (e) {
        console.error("Error running headless browser:", e.message);
    } finally {
        await browser.close();
    }
}

if (process.argv.length < 5) {
    console.error("Usage: node run_wasm_native.js <user> <event> <id> [embedUrl]");
    process.exit(1);
}

const [,, user, event, id, embedUrl] = process.argv;
extractM3U8(user, event, id, embedUrl);
`;

fs.writeFileSync("src/providers/run_wasm_native.js", run_wasm_native);
