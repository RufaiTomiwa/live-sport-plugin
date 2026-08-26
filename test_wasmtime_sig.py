import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# It seems set_stream takes 3 strings! (domain, id1, id2).
# Strings in wasm-bindgen are passed as (ptr, len).
# So 3 strings = 6 parameters. What is the 7th? Probably a returned Promise (an externref or something) or the context.
# Let's just pass https://embed.st, dmin, dmin-tennis-channel/1 ? Wait, the URL is /embed/admin/admin-tennis-channel/1.
# Let's look at set_stream_jw to see if it's the same.

for e in module.exports:
    if e.name == "set_stream_jw":
        print(f"{e.name}: params={list(e.type.params)}, results={list(e.type.results)}")
