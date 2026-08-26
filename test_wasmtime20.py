import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# Wait, the string was not printed because it's neither ptr nor length being < 1000?
# What were the exact args? (1048572, 1080192)
# Oh, __wbg_new_b5d9e2fb389fef91 is __wbg_new_with_str_and_init.
# It takes (ptr, len, string_ptr, string_len). 4 arguments?!
# Let's inspect the signature of __wbg_new_b5d9e2fb389fef91
for i in module.imports:
    if "new" in i.name:
        print(f"{i.name}: params={list(i.type.params)}, results={list(i.type.results)}")

