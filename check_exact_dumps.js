const fs = require('fs');
if (!fs.existsSync('mem_at_write.bin')) process.exit(1);

const memWrite = fs.readFileSync('mem_at_write.bin');
const memDecode = fs.readFileSync('mem_at_decode.bin');
const ciphertext = fs.readFileSync('fetch_payload.bin').subarray(3);
const nonceB64 = fs.readFileSync('goat_nonce.txt', 'utf8').trim();
const nonce = Buffer.from(nonceB64, 'base64');

console.log('Nonce found in memWrite?', memWrite.indexOf(nonce));
console.log('Ciphertext found in memWrite?', memWrite.indexOf(ciphertext));
console.log('Ciphertext16 found in memWrite?', memWrite.indexOf(ciphertext.subarray(0, 16)));

const diffs = [];
for (let i = 0; i < memWrite.length; i++) {
    if (memWrite[i] !== memDecode[i]) {
        diffs.push(i);
    }
}
console.log('Differences between write and decode:', diffs.length);

let blocks = [];
if (diffs.length > 0) {
    let cur = { start: diffs[0], end: diffs[0] };
    for (let i = 1; i < diffs.length; i++) {
        if (diffs[i] === cur.end + 1) {
            cur.end = diffs[i];
        } else {
            blocks.push(cur);
            cur = { start: diffs[i], end: diffs[i] };
        }
    }
    blocks.push(cur);
}

// Print blocks
blocks.forEach(b => {
    const len = b.end - b.start + 1;
    if (len === 32 || len === 12 || len === 16 || len === 24 || len === 8 || len === 48 || len === 64) {
        console.log('Block size ' + len + ' at ' + b.start);
        console.log('write:', memWrite.subarray(b.start, b.end + 1).toString('hex'));
        console.log('decode:', memDecode.subarray(b.start, b.end + 1).toString('hex'));
    } else if (len > 32) {
        console.log('Large block size ' + len + ' at ' + b.start);
    }
});

// Since the pointer for write was 1115384 and decode was 1115752, they are 368 bytes apart!
console.log('Write ptr was 1115384, Decode ptr was 1115752');
