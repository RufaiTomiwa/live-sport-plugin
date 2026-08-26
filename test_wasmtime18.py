import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# Wait, set_stream_jw might be crashing before it throws an error in __wbg_new_b5d9e2fb389fef91!
# Or it throws another error.
# Let's catch all strings!

global_memory = None
imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            str_args = []
            for arg in args:
                if isinstance(arg, int) and 1000000 < arg < 2000000:
                    try:
                        # Grab 64 bytes
                        mem = global_memory.read(store, arg, 64)
                        if b"window" in mem or b"document" in mem or b"fetch" in mem or b"Error" in mem or b"Cannot" in mem:
                            str_args.append(mem)
                    except: pass
            
            if len(str_args) > 0:
                print(f"CALLED {name} with string {str_args}")
            elif name == "__wbg_new_b5d9e2fb389fef91":
                print(f"CALLED {name} {args}")
                ptr, length = args
                if 0 < length < 1000:
                    print("ERR STRING:", global_memory.read(store, ptr, length).decode('utf8', 'ignore'))
            else:
                pass
                
            res = []
            for res_type in func_type.results:
                if res_type == wasmtime.ValType.i32():
                    if "fetch" in name: res.append(2)
                    elif "window" in name: res.append(3)
                    elif "document" in name: res.append(4)
                    else: res.append(1)  
                elif res_type == wasmtime.ValType.i64(): res.append(1)
                elif res_type == wasmtime.ValType.f32(): res.append(0.0)
                elif res_type == wasmtime.ValType.f64(): res.append(0.0)
                elif res_type == wasmtime.ValType.externref():
                    if "fetch" in name: res.append(2)
                    elif "window" in name: res.append(3)
                    elif "document" in name: res.append(4)
                    else: res.append(None)
            
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

set_stream_jw = instance.exports(store)["set_stream_jw"]
try:
    print("Executing set_stream_jw...")
    set_stream_jw(store, domain[0], domain[1], id1[0], id1[1], id2[0], id2[1])
    print("Done executing.")
except Exception as e:
    print("Caught:", e)
