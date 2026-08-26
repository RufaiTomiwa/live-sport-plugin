const { readFileSync } = require('fs');
const vm = require('vm');

async function main() {

const raw = readFileSync('gasm.js', 'utf8');

// Apply patches
let code = raw;
code = code.replace(/export\{[^}]+\}[;]?/g, '');
  // 2. Strip inline export keyword from function declarations, and register on window
  //    e.g. "export function init_wasm(...)" -> "function init_wasm(...)" + "window.init_wasm = init_wasm;"
  //    We collect names and add a registration block at the end
  const exportedFunctions = [];
  code = code.replace(/\bexport\s+function\s+(\w+)/g, (_, name) => {
    exportedFunctions.push(name);
    return `function ${name}`;
  });
  code = code.replace(/\bexport\s+(const|let|var)\s+(\w+)/g, (_, kw, name) => {
    exportedFunctions.push(name);
    return `${kw} ${name}`;
  });
  // Append registrations at the end so window.init_wasm etc. are accessible
  if (exportedFunctions.length) {
    code += `\n// Register exports on global\n` +
      exportedFunctions.map(n => `if (typeof ${n} !== "undefined") { try { self["${n}"] = ${n}; } catch(e) {} }`).join('\n');
  }
code = code.replace(/import\.meta\.url/g, '"https://assets.embedindia.st/js/wasm/gasm.js"');
code = code.replace(/import\.meta/g, '{}');
code = code.replace(/WebAssembly\.instantiateStreaming\s*\(/g, '__patchedInstantiateStreaming__(');

const prefix = `"use strict";
const __gasmExports__ = {};
async function __patchedInstantiateStreaming__(r, i) { return WebAssembly.instantiate(global.__WASM_BUF__, i); }
`;
code = prefix + code;

try {
  const s = new vm.Script(code, { filename: 'gasm.js' });
  console.log('PARSE OK, code length:', code.length);

  // Now try running it
  const { webcrypto } = require('crypto');
  const { existsSync } = require('fs');
  const wasmBuf = existsSync('gasm_cached.wasm') ? readFileSync('gasm_cached.wasm') : null;

  let wasmInstance = null;
  const origInstantiate = WebAssembly.instantiate.bind(WebAssembly);
  const sandboxWA = {
    instantiate: async (buf, imports) => {
      console.log('WA.instantiate called, buf type:', typeof buf);
      const r = await origInstantiate(buf, imports);
      wasmInstance = r.instance;
      return r;
    },
    instantiateStreaming: async (resp, imports) => {
      console.log('WA.instantiateStreaming called (intercepted)');
      const r = await origInstantiate(wasmBuf, imports);
      wasmInstance = r.instance;
      return r;
    },
    compile: WebAssembly.compile.bind(WebAssembly),
    validate: WebAssembly.validate.bind(WebAssembly),
    Module: WebAssembly.Module
  };

  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Promise, Error, TypeError, RangeError, JSON, Math, Date,
    Array, Object, String, Number, Boolean, Map, Set, WeakMap, WeakSet,
    Symbol, Uint8Array, Uint32Array, Int8Array, ArrayBuffer, DataView,
    TextDecoder, TextEncoder, fetch,
    WebAssembly: sandboxWA,
    crypto: webcrypto,
    window: null, self: null,
    document: {
      createElement: () => ({ setAttribute: ()=>{}, remove: ()=>{}, style: {}, parentNode: null }),
      getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
      body: { appendChild: ()=>{}, removeChild: ()=>{} }, defaultView: null
    },
    location: { host: 'embedindia.st', hostname: 'embedindia.st', protocol: 'https:', href: 'https://embedindia.st/embed-noads/rally-tv', pathname: '/embed-noads/rally-tv' },
    navigator: { userAgent: 'Mozilla/5.0' },
    performance: { now: () => Date.now() },
    __WASM_BUF__: wasmBuf,
    __gasmExports__: {}
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.document.defaultView = sandbox;

  const ctx = vm.createContext(sandbox);
  let execErr = null;
  try {
    const res = s.runInContext(ctx);
    if (res && typeof res.then === 'function') {
      await res;
    }
  } catch(e) {
    console.log('Script exec error:', e.message.slice(0, 100));
  }

  // Now call init_wasm from the context (this triggers WASM loading)
  console.log('Calling init_wasm from context...');
  try {
    const initResult = ctx.init_wasm ? ctx.init_wasm() : (ctx.window && ctx.window.init_wasm ? ctx.window.init_wasm() : null);
    console.log('init_wasm returned:', typeof initResult);
    if (initResult && typeof initResult.then === 'function') {
      await initResult;
    } else {
      // Wait a bit for async stuff to settle
      await new Promise(r => setTimeout(r, 3000));
    }
  } catch(e) {
    console.log('init_wasm error:', e.message.slice(0, 100));
    await new Promise(r => setTimeout(r, 2000));
  }

  if (wasmInstance) {
    console.log('SUCCESS: WASM instantiated!');
    console.log('Exports:', Object.keys(wasmInstance.exports));
  } else {
    console.log('WASM not instantiated after init_wasm.');
    // Check if WebAssembly was ever called
    console.log('Sandbox keys:', Object.keys(ctx).filter(k => !['window','self','document','location'].includes(k)).slice(0, 20));
  }
} catch(e) {
  console.error('PARSE/COMPILE ERROR:', e.message);
  const lines = code.split('\n');
  const errLine = (e.lineNumber || 1) - 1;
  for (let i = Math.max(0, errLine - 2); i <= Math.min(lines.length - 1, errLine + 2); i++) {
    console.log(i + 1, ':', lines[i].slice(0, 120));
  }
}
} // end main

main().catch(e => console.error('FATAL:', e.message));
