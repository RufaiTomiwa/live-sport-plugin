const assert = require('assert');
const StreamedPkProvider = require('./src/providers/StreamedPkProvider');

async function runTest() {
    console.log("Starting StreamedPkProvider concurrency test...");
    
    let currentConcurrent = 0;
    let maxConcurrent = 0;
    let resolvedCount = 0;

    const mockEmbedStProvider = {
        resolveStream: async (embedUrl, matchCategory, label, opts) => {
            currentConcurrent++;
            if (currentConcurrent > maxConcurrent) {
                maxConcurrent = currentConcurrent;
            }
            
            // Simulate network/WASM delay
            await new Promise(resolve => setTimeout(resolve, 50));
            
            resolvedCount++;
            currentConcurrent--;
            
            return [{ name: 'TestStream', url: embedUrl + '/stream.m3u8' }];
        }
    };

    const provider = new StreamedPkProvider({ 
        embedStProvider: mockEmbedStProvider,
        circuitBreaker: {
            wrap: (name, fn) => {
                return {
                    fire: async (...args) => {
                        // Mock the stream fetch to return 10 streams
                        if (name === 'StreamedPk_fetchStreams') {
                            const streams = [];
                            for(let i=0; i<10; i++) {
                                streams.push({ embedUrl: 'https://embed.st/stream/' + i });
                            }
                            return streams;
                        }
                        return fn(...args);
                    }
                }
            }
        },
        proxyFetch: async () => ({ ok: true, json: async () => [] })
    });

    const streams = await provider.resolveStream('test-id', 'test-category', 'Test Match', { streamSource: 'admin', streamId: '123' });

    console.log("-----------------------------------------");
    console.log("Test Results:");
    console.log("Expected total streams: 10");
    console.log("Resolved streams length: " + streams.length);
    console.log("Max concurrent WASM processes: " + maxConcurrent);
    console.log("Expected max concurrent: 3");
    
    if (maxConcurrent <= 3 && streams.length === 10) {
        console.log("\n✅ SUCCESS: Chunking is working perfectly! Max concurrency never exceeded 3.");
    } else {
        console.log("\n❌ FAILED: Concurrency exceeded limits or failed to resolve all streams.");
    }
}

runTest().catch(console.error);
