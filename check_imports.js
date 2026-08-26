const fs = require('fs');

async function run() {
  const buf = fs.readFileSync('lock.wasm');
  const mod = await WebAssembly.compile(buf);
  const imports = WebAssembly.Module.imports(mod);
  console.log(imports);
}
run();
