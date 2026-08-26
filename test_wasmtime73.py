import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# Ah! set_stream takes 7 parameters!
# The last one is anyref!
# What does lock.js pass to it?
