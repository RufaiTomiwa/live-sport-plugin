const fs = require('fs');

if (!fs.existsSync('wasm_mem_dmp_0.bin')) {
    console.log('No dumps saved!');
    process.exit(1);
}

const memLast = fs.readFileSync('wasm_mem_dmp_20.bin');
let idx = memLast.indexOf(Buffer.from('playlist.m3u8'));
console.log('M3U8 at in dump 20:', idx);

const memFirst = fs.readFileSync('wasm_mem_dmp_0.bin');

const differences = [];
for (let i = 1000000; i < memLast.length; i++) {
    if (memFirst[i] !== memLast[i]) {
        differences.push(i);
    }
}
console.log('Differences found:', differences.length);

if (differences.length > 0 && differences.length < 10000) {
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
             console.log('MemFirst:', memFirst.subarray(b.start, b.end + 1).toString('hex'));
             console.log('MemLast:', memLast.subarray(b.start, b.end + 1).toString('hex'));
        }
    });
}
