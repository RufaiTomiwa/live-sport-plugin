import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# We want to hook __wbindgen_malloc. We can't really hook an export easily without instantiating it, 
# but we CAN just write a Node script that calls it.

# LO wants me to use the wasm-wasmtime skill.
