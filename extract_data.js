const fs = require('fs');
const wasm = fs.readFileSync('lock.wasm');

function readUleb128(buf, offset) {
    let result = 0;
    let shift = 0;
    let bytesRead = 0;
    while (true) {
        let byte = buf[offset + bytesRead];
        bytesRead++;
        result |= (byte & 0x7f) << shift;
        shift += 7;
        if ((byte & 0x80) === 0) break;
    }
    return { value: result, bytesRead };
}

let offset = 8; // skip magic and version
let dataSegments = [];

while (offset < wasm.length) {
    let sectionId = wasm[offset++];
    let { value: sectionSize, bytesRead: sizeBytes } = readUleb128(wasm, offset);
    offset += sizeBytes;
    
    if (sectionId === 11) { // Data section
        let { value: numSegments, bytesRead: segBytes } = readUleb128(wasm, offset);
        let secOffset = offset + segBytes;
        
        for (let i = 0; i < numSegments; i++) {
            let segType = wasm[secOffset++];
            // Skip offset expr
            while (wasm[secOffset] !== 0x0B) { secOffset++; }
            secOffset++; // skip 0x0B
            
            let { value: dataSize, bytesRead: dBytes } = readUleb128(wasm, secOffset);
            secOffset += dBytes;
            
            dataSegments.push(wasm.subarray(secOffset, secOffset + dataSize));
            secOffset += dataSize;
        }
        break;
    } else {
        offset += sectionSize;
    }
}

let allData = Buffer.concat(dataSegments);
console.log('Total data size:', allData.length);

// Let's find all 32-byte keys that look random (e.g. no printable ASCII)
// We'll just look for hex strings or random bytes.
// Actually, keys might be encoded as hex strings!
const hexRegex = /[0-9a-f]{64}/gi;
let match;
const dataStr = allData.toString('utf8');
while ((match = hexRegex.exec(dataStr)) !== null) {
    console.log('Found 64-char hex string:', match[0]);
}

// Check for 32-char hex strings (16 bytes)
const hexRegex32 = /[0-9a-f]{32}/gi;
while ((match = hexRegex32.exec(dataStr)) !== null) {
    console.log('Found 32-char hex string:', match[0]);
}

