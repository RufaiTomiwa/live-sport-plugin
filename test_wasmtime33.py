import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

for e in module.exports:
    if "stream" in e.name:
        print(f"Export {e.name}: {e.type}")
