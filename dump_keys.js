const fs = require('fs');
const wasm = fs.readFileSync('lock.wasm');

function readUleb128(buf, offset) {
    let result = 0, shift = 0, bytesRead = 0;
    while (true) {
        let byte = buf[offset + bytesRead];
        bytesRead++;
        result |= (byte & 0x7f) << shift;
        shift += 7;
        if ((byte & 0x80) === 0) break;
    }
    return { value: result, bytesRead };
}

let offset = 8;
let dataSegments = [];
while (offset < wasm.length) {
    let sectionId = wasm[offset++];
    let { value: sectionSize, bytesRead: sizeBytes } = readUleb128(wasm, offset);
    offset += sizeBytes;
    if (sectionId === 11) {
        let { value: numSegments, bytesRead: segBytes } = readUleb128(wasm, offset);
        let secOffset = offset + segBytes;
        for (let i = 0; i < numSegments; i++) {
            let segType = wasm[secOffset++];
            while (wasm[secOffset] !== 0x0B) { secOffset++; }
            secOffset++;
            let { value: dataSize, bytesRead: dBytes } = readUleb128(wasm, secOffset);
            secOffset += dBytes;
            dataSegments.push(wasm.subarray(secOffset, secOffset + dataSize));
            secOffset += dataSize;
        }
        break;
    } else offset += sectionSize;
}

let allData = Buffer.concat(dataSegments);
let keys = new Set();
for (let i = 0; i <= allData.length - 32; i++) {
    keys.add(allData.subarray(i, i + 32).toString('hex'));
}

fs.writeFileSync('all_keys.txt', Array.from(keys).join('\n'));
console.log('Saved', keys.size, 'keys');
