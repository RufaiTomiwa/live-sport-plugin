import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# We want to call __wbindgen_start and see if it runs!
imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            # print(f"Called {name} with {args}")
            # If the import expects a return value, we MUST return something of that type
            res = []
            for res_type in func_type.results:
                if res_type == wasmtime.ValType.i32():
                    res.append(0)
                elif res_type == wasmtime.ValType.i64():
                    res.append(0)
                elif res_type == wasmtime.ValType.f32():
                    res.append(0.0)
                elif res_type == wasmtime.ValType.f64():
                    res.append(0.0)
                elif res_type == wasmtime.ValType.externref():
                    res.append(None)
            
            if len(res) == 0:
                return None
            elif len(res) == 1:
                return res[0]
            else:
                return tuple(res)
        return dummy
        
    func_type = i.type
    if isinstance(func_type, wasmtime.FuncType):
        imports.append(wasmtime.Func(store, func_type, make_dummy(i.name, func_type), access_caller=True))

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
    ptr = malloc(store, len(url), 1)  # Malloc usually takes (len, alignment)
    print("Malloc returned:", ptr)
    # Write to memory
    mem_slice = memory.read(store, ptr, len(url))
    # Write... in wasmtime python, we use memory.write
    memory.write(store, url, ptr)
    
    # Call init_wasm
    init_wasm = instance.exports(store)["init_wasm"]
    init_wasm(store)
    
    # Call set_stream
    set_stream = instance.exports(store)["set_stream"]
    set_stream(store, ptr, len(url))
    
except Exception as e:
    print("Error:", e)

# Dump memory
with open("wasmtime_mem.bin", "wb") as f:
    f.write(memory.read(store, 0, memory.data_len(store)))

print("Memory dumped!")
