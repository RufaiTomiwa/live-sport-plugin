/**
 * embedindia_decrypt.mjs
 * Pure Node.js decryptor for embedindia.st streams — no browser, no Playwright.
 *
 * How it works:
 * 1. Fetch encrypted blob from embedindia.st/fetch (pure HTTP, protobuf encoded)
 * 2. Patch gasm.js (strip ES module syntax, inject WASM buffer shim)
 * 3. Run patched gasm.js via vm.Script in a browser-like context
 * 4. Call set_stream_jw() with the blob, scan WASM memory for the m3u8 URL
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { webcrypto } from 'crypto';
import { fileURLToPath } from 'url';
import vm from 'vm';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Pure HTTP helpers ────────────────────────────────────────────────────────

function encodeChannelProto(channel) {
  const buf = Buffer.from(channel, 'utf8');
  return Buffer.concat([Buffer.from([0x0a, buf.length]), buf]);
}

async function fetchEncryptedBlob(channel) {
  const protoBody = encodeChannelProto(channel);
  const res = await fetch('https://embedindia.st/fetch', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(protoBody.length),
      'Referer': `https://embedindia.st/embed-noads/${channel}`,
      'Origin': 'https://embedindia.st'
    },
    body: protoBody
  });
  const buf = Buffer.from(await res.arrayBuffer());
  // Parse protobuf field 1 = encrypted blob
  let pos = 0, encrypted = null;
  while (pos < buf.length) {
    const tag = buf[pos++];
    const fieldNum = tag >> 3;
    const wireType = tag & 0x7;
    if (wireType === 2) {
      let len = 0, shift = 0;
      while (true) {
        const b = buf[pos++];
        len |= (b & 0x7f) << shift;
        if (!(b & 0x80)) break;
        shift += 7;
      }
      if (fieldNum === 1) encrypted = buf.slice(pos, pos + len);
      pos += len;
    } else break;
  }
  return encrypted;
}

async function getWasmBuffer() {
  const cachePath = path.join(__dirname, 'gasm_cached.wasm');
  if (existsSync(cachePath)) return readFileSync(cachePath);
  console.error('[embedindia] Downloading gasm.wasm...');
  const res = await fetch('https://assets.embedindia.st/js/wasm/gasm.wasm', {
    headers: { 'Referer': 'https://embedindia.st/', 'Origin': 'https://embedindia.st' }
  });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(cachePath, buf);
  return buf;
}

// ─── gasm.js patcher ─────────────────────────────────────────────────────────

function patchGasmJs(code, channel) {
  // 1. Strip trailing ES module named export: export{A,B as C}
  code = code.replace(/export\{[^}]+\}[;]?/g, '');

  // 2. Strip inline export keyword from function declarations
  //    e.g. "export function init_wasm" -> "function init_wasm"
  code = code.replace(/\bexport\s+(function|class|const|let|var)\b/g, '$1');

  // 3. Handle import.meta references
  code = code.replace(/import\.meta\.url/g, '"https://assets.embedindia.st/js/wasm/gasm.js"');
  code = code.replace(/import\.meta/g, '{}');

  // 4. Strip any top-level import statements (shouldn't be in gasm.js but just in case)
  code = code.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '');

  // 5. Intercept WebAssembly.instantiateStreaming
  code = code.replace(
    /WebAssembly\.instantiateStreaming\s*\(/g,
    '__patchedInstantiateStreaming__('
  );

  // 6. Intercept location.host to point at embedindia.st
  // (gasm.js derives asset URLs from location.host)

  const prefix = `
"use strict";
const __gasmExports__ = {};
const __INJECTED_CHANNEL__ = ${JSON.stringify(channel)};

async function __patchedInstantiateStreaming__(responseOrPromise, imports) {
  // Use the local WASM buffer that was injected into this context
  if (typeof __WASM_BUF__ !== "undefined" && __WASM_BUF__) {
    return WebAssembly.instantiate(__WASM_BUF__, imports);
  }
  // fallback: try to await the response and use its buffer
  const res = await responseOrPromise;
  const buf = await res.arrayBuffer();
  return WebAssembly.instantiate(buf, imports);
}

// Track the last return from set_stream_jw for URL extraction
let __lastStreamResult__ = null;

`;

  return prefix + code;
}


// ─── Main decryptor ───────────────────────────────────────────────────────────

async function runGasmDecrypt(channel) {
  const [encrypted, wasmBuf] = await Promise.all([
    fetchEncryptedBlob(channel),
    getWasmBuffer()
  ]);
  if (!encrypted) throw new Error('No encrypted blob from server');

  const gasmRaw = readFileSync(path.join(__dirname, 'gasm.js'), 'utf8');
  const gasmPatched = patchGasmJs(gasmRaw, channel);


  // Build a browser-like sandbox context
  const sandbox = {
    // Core JS
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Promise,
    Error,
    TypeError,
    RangeError,
    JSON,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Symbol,
    Uint8Array,
    Uint32Array,
    Int8Array,
    ArrayBuffer,
    DataView,
    TextDecoder,
    TextEncoder,
    // Node.js native fetch + WebAssembly
    fetch,
    WebAssembly,
    // Crypto
    crypto: webcrypto,
    // DOM stubs
    window: null, // set after context created
    self: null,
    document: {
      createElement: () => ({ setAttribute: ()=>{}, remove: ()=>{}, style: {}, parentNode: null }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      body: { appendChild: ()=>{}, removeChild: ()=>{} },
      defaultView: null
    },
    location: {
      host: 'embedindia.st',
      hostname: 'embedindia.st',
      protocol: 'https:',
      href: `https://embedindia.st/embed-noads/${channel}`,
      pathname: `/embed-noads/${channel}`
    },
    navigator: { userAgent: 'Mozilla/5.0' },
    performance: { now: () => Date.now() },
    // WASM buffer injection
    __WASM_BUF__: wasmBuf,
    // Will be populated by gasm.js
    __gasmExports__: {}
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.document.defaultView = sandbox;

  // Intercept WebAssembly.instantiate to capture the instance
  let wasmInstance = null;
  const origInstantiate = WebAssembly.instantiate.bind(WebAssembly);
  sandbox.WebAssembly = {
    ...WebAssembly,
    instantiate: async (buf, imports) => {
      const r = await origInstantiate(buf, imports);
      wasmInstance = r.instance;
      return r;
    },
    instantiateStreaming: async (responseOrPromise, imports) => {
      const r = await origInstantiate(wasmBuf, imports);
      wasmInstance = r.instance;
      return r;
    },
    compile: WebAssembly.compile.bind(WebAssembly),
    validate: WebAssembly.validate.bind(WebAssembly),
    Module: WebAssembly.Module
  };

  const ctx = vm.createContext(sandbox);

  console.error('[embedindia] Running gasm.js in vm context...');

  let script;
  try {
    script = new vm.Script(gasmPatched, { filename: 'gasm.js' });
  } catch(e) {
    throw new Error(`gasm.js parse error: ${e.message}`);
  }


  try {
    const resultPromise = script.runInContext(ctx);
    if (resultPromise && typeof resultPromise.then === 'function') {
      await resultPromise;
    }
  } catch(e) {
    console.error('[embedindia] gasm.js execution error:', e.message);
    // Some DOM errors expected — continue if we got a WASM instance
  }

  if (!wasmInstance) {
    throw new Error('WASM did not instantiate — gasm.js failed to set up imports');
  }

  const exports = wasmInstance.exports;
  console.error('[embedindia] WASM ready, exports:', Object.keys(exports));

  // Call init_wasm if available
  if (exports.init_wasm) {
    try { exports.init_wasm(); } catch(e) {
      console.error('[embedindia] init_wasm error:', e.message);
    }
  }

  // Allocate and write encrypted data into WASM memory
  let inputPtr;
  try {
    inputPtr = exports.__wbindgen_malloc(encrypted.length, 1);
    console.error(`[embedindia] Allocated WASM ptr=${inputPtr}`);
  } catch(e) {
    inputPtr = 65536; // fallback: use a safe offset
    console.error(`[embedindia] malloc failed, using fixed ptr=${inputPtr}`);
  }
  new Uint8Array(exports.memory.buffer).set(new Uint8Array(encrypted), inputPtr);

  console.error(`[embedindia] Calling set_stream_jw(${inputPtr}, ${encrypted.length})`);
  try {
    exports.set_stream_jw(inputPtr, encrypted.length);
  } catch(e) {
    console.error('[embedindia] set_stream_jw threw:', e.message);
  }

  // Scan memory for decrypted m3u8 URL
  const mem8 = new Uint8Array(exports.memory.buffer);
  const memStr = new TextDecoder('utf-8', { fatal: false }).decode(mem8);

  // Find all m3u8 occurrences and the https:// before them
  const urlPattern = /https?:\/\/[^\x00-\x1f\s"<>]{10,}/g;
  let best = null;
  let match;
  while ((match = urlPattern.exec(memStr)) !== null) {
    if (match[0].includes('.m3u8') || match[0].includes('/hls/') || match[0].includes('akamai')) {
      best = match[0].replace(/[\x00-\x1f]+$/, '').trim();
      console.error('[embedindia] Found candidate URL:', best);
    }
  }

  return best;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const channel = process.argv[2] || 'rally-tv';
console.error(`[embedindia] Starting — channel: ${channel}`);

runGasmDecrypt(channel)
  .then(url => {
    if (url) {
      process.stdout.write(url + '\n');
      process.exit(0);
    } else {
      console.error('[embedindia] No URL found in WASM memory');
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('[embedindia] Fatal:', e.message);
    process.exit(1);
  });
