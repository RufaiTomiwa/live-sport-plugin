const fs = require('fs');

const wasmBuffer = fs.readFileSync('lock.wasm');

// We need to implement a full polyfill for WASM imports
async function init() {
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    
    // Polyfill for TextDecoder/TextEncoder
    const { TextDecoder, TextEncoder } = require('util');
    const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
    const textEncoder = new TextEncoder('utf-8');

    let wasmMemory;
    let cachegetUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachegetUint8Memory0 === null || cachegetUint8Memory0.byteLength === 0) {
            cachegetUint8Memory0 = new Uint8Array(wasmMemory.buffer);
        }
        return cachegetUint8Memory0;
    }

    let cachegetInt32Memory0 = null;
    function getInt32Memory0() {
        if (cachegetInt32Memory0 === null || cachegetInt32Memory0.byteLength === 0) {
            cachegetInt32Memory0 = new Int32Array(wasmMemory.buffer);
        }
        return cachegetInt32Memory0;
    }

    function getStringFromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return textDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }

    let WASM_VECTOR_LEN = 0;

    function passStringToWasm0(arg, malloc, realloc) {
        if (typeof(arg) !== 'string') throw new Error(xpected a string argument, found );
        if (realloc === undefined) {
            const buf = textEncoder.encode(arg);
            const ptr = malloc(buf.length, 1) >>> 0;
            getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }
        // ... more complex if realloc needed
        let len = arg.length;
        let ptr = malloc(len, 1) >>> 0;
        const mem = getUint8Memory0();
        let offset = 0;
        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7F) break;
            mem[ptr + offset] = code;
        }
        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
            const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
            const ret = textEncoder.encodeInto(arg, view);
            offset += ret.written;
            ptr = realloc(ptr, len, offset, 1) >>> 0;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    }

    const heap = new Array(128).fill(undefined);
    heap.push(undefined, null, true, false);
    let heap_next = heap.length;

    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];
        heap[idx] = obj;
        return idx;
    }

    function getObject(idx) { return heap[idx]; }

    function dropObject(idx) {
        if (idx < 132) return;
        heap[idx] = heap_next;
        heap_next = idx;
    }

    function takeObject(idx) {
        const ret = getObject(idx);
        dropObject(idx);
        return ret;
    }

    // Our intercepted M3U8 string
    let resolvedM3U8 = null;
    let originalUrl = null;

    // We will use native node-fetch to make the actual request!
    const fetch = require('node-fetch');

    const imports = {
        './locked_bg.js': {
            __wbindgen_string_get: function(arg0, arg1) {
                const obj = getObject(arg1);
                const ret = typeof(obj) === 'string' ? obj : undefined;
                var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.exports.__wbindgen_malloc, wasm.exports.__wbindgen_realloc);
                var len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            },
            __wbindgen_object_drop_ref: function(arg0) {
                takeObject(arg0);
            },
            // Add all 70+ imports by copying from the actual locked_bg.js file!
            // Wait, where is locked_bg.js?
            // The browser downloads it when loading https://embed.st/embed/admin/admin-tennis-channel/1.
            // We can just download https://strmd.b-cdn.net/js/wasm/locked_bg.js?
        }
    };
}
