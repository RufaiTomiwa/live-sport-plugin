import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")
for e in module.exports:
    if "set_stream" in e.name:
        print("Export:", e.name, e.type.params, e.type.results)
