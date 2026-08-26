import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# We found that __wbg_new_b5d9e2fb389fef91 gets called immediately with length 1080152.
# Wait, look at the panic string: "when slicing ----byte index ---- is out of bounds... the len is 1048572" 
# Oh! The panic happens because we pass an empty string, or we mess up memory.
# The __wbg_new_b5d9e2fb389fef91 is actually 
ew Error(s).
# This is called *because* Rust panicked!
# Yes, Rust panics, formats an error string, and calls 
ew Error(s) to throw it into JS!
# So we need to look at what's called *before* the panic. Wait, __wbg_new_b5d9e2fb389fef91 was the FIRST import called!
# Meaning it panicked *before* calling any JS imports!
