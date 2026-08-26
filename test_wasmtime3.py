import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# We want to call __wbindgen_start and see if it runs!
imports = []
for i in module.imports:
    def make_dummy(name):
        def dummy(caller, *args):
            print(f"Called {name} with {args}")
            if name == "__wbg_fetch_e6e8e0a221783759":
                pass
            return 0
        return dummy
        
    func_type = i.type
    if isinstance(func_type, wasmtime.FuncType):
        imports.append(wasmtime.Func(store, func_type, make_dummy(i.name), access_caller=True))

instance = wasmtime.Instance(store, module, imports)

try:
    if "__wbindgen_start" in instance.exports(store):
        instance.exports(store)["__wbindgen_start"](store)
        print("Called __wbindgen_start")
except Exception as e:
    print("Start err:", e)

# Malloc a string
url = b"https://embed.st/embed/admin/admin-tennis-channel/1"
malloc = instance.exports(store)["__wbindgen_malloc"]
memory = instance.exports(store)["memory"]

try:
    ptr = malloc(store, len(url))
    print("Malloc returned:", ptr)
    # Write to memory
    data = memory.data_ptr(store)
    import ctypes
    buf = (ctypes.c_char * len(url)).from_address(ctypes.addressof(data.contents) + ptr)
    buf.value = url
    
    # Call set_stream
    set_stream = instance.exports(store)["set_stream"]
    set_stream(store, ptr, len(url))
    
except Exception as e:
    print("Error:", e)

# Dump memory
with open("wasmtime_mem.bin", "wb") as f:
    f.write(memory.read(store, 0, memory.data_len(store)))

print("Memory dumped!")
