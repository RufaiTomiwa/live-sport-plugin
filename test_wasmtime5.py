import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            # print(f"Called {name} with {args}")
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

if "__wbindgen_start" in instance.exports(store):
    instance.exports(store)["__wbindgen_start"](store)

malloc = instance.exports(store)["__wbindgen_malloc"]
memory = instance.exports(store)["memory"]

init_wasm = instance.exports(store)["init_wasm"]
init_wasm(store)

# set_stream takes 7 parameters?!
# In JS, it was: set_stream(domain, id1, id2)?
# Actually, the original URL was https://embed.st/embed/admin/admin-tennis-channel/1.
# So it's probably (domain_ptr, domain_len, id1_ptr, id1_len, id2_ptr, id2_len, _unused)
# Let's check lock.js how set_stream is called!
