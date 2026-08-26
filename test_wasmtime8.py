import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

global_memory = None

imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            print("CALLED:", name, args)
            
            # For strings, if we receive (ptr, len) we can print them!
            if name == "__wbg_new_b5d9e2fb389fef91":
                # __wbg_new_with_str_and_init
                # Actually __wbg_new_b5d9e2fb389fef91 might be 
ew Error("...")
                pass
                
            res = []
            for res_type in func_type.results:
                if res_type == wasmtime.ValType.i32() or res_type == wasmtime.ValType.i64():
                    res.append(1)  # Return 1 instead of 0 to avoid null pointer issues
                elif res_type == wasmtime.ValType.f32() or res_type == wasmtime.ValType.f64():
                    res.append(0.0)
                elif res_type == wasmtime.ValType.externref():
                    res.append(None)
            
            if len(res) == 0: return None
            elif len(res) == 1: return res[0]
            else: return tuple(res)
        return dummy
        
    func_type = i.type
    if isinstance(func_type, wasmtime.FuncType):
        imports.append(wasmtime.Func(store, func_type, make_dummy(i.name, func_type), access_caller=True))

instance = wasmtime.Instance(store, module, imports)
global_memory = instance.exports(store)["memory"]

if "__wbindgen_start" in instance.exports(store):
    instance.exports(store)["__wbindgen_start"](store)

malloc = instance.exports(store)["__wbindgen_malloc"]
init_wasm = instance.exports(store)["init_wasm"]
init_wasm(store)

def pass_string(s):
    ptr = malloc(store, len(s), 1)
    global_memory.write(store, s, ptr)
    return ptr, len(s)

domain = pass_string(b"https://embed.st")
id1 = pass_string(b"admin")
id2 = pass_string(b"admin-tennis-channel/1")

set_stream = instance.exports(store)["set_stream"]
try:
    print("Calling set_stream")
    set_stream(store, domain[0], domain[1], id1[0], id1[1], id2[0], id2[1], None)
    
    # After it runs, let's dump strings from memory!
    # Wait, __wbg_new_b5d9e2fb389fef91 (1048572, 1080152) 
    # Let's read memory at 1048572 for 1080152 ? No, second arg is length!
    mem = global_memory.read(store, 0, global_memory.data_len(store))
    print("Mem at 1048572 len 10:", mem[1048572:1048572+50])
    
except Exception as e:
    print("set_stream err:", e)
