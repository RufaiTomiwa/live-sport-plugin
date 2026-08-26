const fs = require('fs');

if (!fs.existsSync('full_dump_0.bin')) {
    console.log('No dumps saved!');
    process.exit(1);
}

const mem0 = fs.readFileSync('full_dump_0.bin');
const mem4 = fs.readFileSync('full_dump_4.bin');

// M3U8 string
const m3u8Bytes = Buffer.from('playlist.m3u8');
const idx = mem4.indexOf(m3u8Bytes);
console.log('M3U8 found in mem4 at:', idx);

// If the key is generated dynamically, and cleared after, we might see differences between mem0 and mem4
const diffs = [];
for (let i = 0; i < mem0.length; i++) {
    if (mem0[i] !== mem4[i]) {
        diffs.push(i);
    }
}
console.log('Total byte differences:', diffs.length);

let blocks = [];
let cur = { start: diffs[0], end: diffs[0] };
for (let i = 1; i < diffs.length; i++) {
    if (diffs[i] === cur.end + 1) {
        cur.end = diffs[i];
    } else {
        blocks.push(cur);
        cur = { start: diffs[i], end: diffs[i] };
    }
}
if(cur.start !== undefined) blocks.push(cur);

// We are looking for 32 byte chunks (the ChaCha20 key)
blocks.forEach(b => {
    const len = b.end - b.start + 1;
    if (len === 32 || len === 12 || len === 16 || len === 24 || len === 8 || len === 48 || len === 64) {
        console.log('Block size ' + len + ' at ' + b.start);
        console.log('mem0:', mem0.subarray(b.start, b.end + 1).toString('hex'));
        console.log('mem4:', mem4.subarray(b.start, b.end + 1).toString('hex'));
    }
});

