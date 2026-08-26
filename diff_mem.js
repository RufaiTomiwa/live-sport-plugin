const fs = require('fs');

const mem1 = fs.readFileSync('wasm_mem_dump.bin');
const mem2 = fs.readFileSync('wasm_mem_playwright_3.bin');

const differences = [];
for (let i = 1000000; i < 1120000; i++) {
    if (mem1[i] !== mem2[i]) {
        differences.push(i);
    }
}

console.log('Differences found:', differences.length);
if (differences.length > 0 && differences.length < 5000) {
    let diffBlocks = [];
    let currentBlock = { start: differences[0], end: differences[0] };
    for (let i = 1; i < differences.length; i++) {
        if (differences[i] === currentBlock.end + 1) {
            currentBlock.end = differences[i];
        } else {
            diffBlocks.push(currentBlock);
            currentBlock = { start: differences[i], end: differences[i] };
        }
    }
    diffBlocks.push(currentBlock);
    
    diffBlocks.forEach(b => {
        let len = b.end - b.start + 1;
        if (len === 32 || len === 12 || len === 16 || len === 24 || len === 8) {
             console.log("Block size " + len + " at " + b.start);
             console.log('Mem1:', mem1.subarray(b.start, b.end + 1).toString('hex'));
             console.log('Mem2:', mem2.subarray(b.start, b.end + 1).toString('hex'));
        }
    });
}
