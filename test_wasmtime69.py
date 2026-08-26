import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# Wait, __wbg_new_b5d9e2fb389fef91 is the FIRST import called inside set_stream!
# That means it panics IMMEDIATELY without calling anything else.
# WHY?
# 1048572 length 1080152 is HUGE! That's 1MB!
# Why is it creating a 1MB string? Oh... it's probably reading the ENTIRE WASM file from memory! No, it's just passing an uninitialized pointer because it crashed.
