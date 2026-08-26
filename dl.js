const fs = require('fs');
const axios = require('axios');
async function dl() {
  const js = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.js');
  let code = js.data;
  code = code.replace(/import\.meta/g, '({url: "https://strmd.b-cdn.net/js/wasm/lock.js"})');
  fs.writeFileSync('lock.mjs', code);
  
  const wasm = await axios.get('https://strmd.b-cdn.net/js/wasm/lock.wasm', {responseType: 'arraybuffer'});
  fs.writeFileSync('lock.wasm', wasm.data);
}
dl();
