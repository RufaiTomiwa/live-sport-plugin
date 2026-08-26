const fs = require('fs');
const axios = require('axios');

async function extractKey() {
  const r = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
  const wasmBuf = Buffer.from(r.data);
  fs.writeFileSync('lock.wasm', wasmBuf);
  console.log('Downloaded lock.wasm, size:', wasmBuf.length);
}
extractKey();
