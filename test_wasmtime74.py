import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# Wait!
# In javascript, set_stream_jw in lock.js DOES NOT CALL wasm.set_stream_jw!
# It sets some globals and calls T59HXD("set_stream_jw") or something similar!
# T59HXD is probably a wrapper that handles passing all string arguments to WASM!
# Yes! lock.set_stream_jw("https://embed.st", "admin", "admin-tennis-channel/1") passes strings via JS, 
# and JS allocates them using __wbindgen_malloc, and THEN calls WASM!
# When I call WASM set_stream_jw directly from Python without __wbindgen_malloc-ing the arguments correctly, WASM panics inside.
# But wait, I DID malloc them in my Python script! pass_string(b"https://embed.st")!
# What did I do wrong?
# Oh, set_stream takes domain, 	ype, id, ??... let's look at set_stream_jw args!
