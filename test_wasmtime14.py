import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

global_memory = None
fetch_called = False

imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            global fetch_called
            if name == "__wbg_fetch_e6e8e0a221783759":
                fetch_called = True
                print("FETCH CALLED!")
                mem = global_memory.read(store, 0, global_memory.data_len(store))
                with open("wasmtime_mem_at_fetch.bin", "wb") as f:
                    f.write(mem)
                
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

set_stream = instance.exports(store)["set_stream"]
try:
    set_stream(store, domain[0], domain[1], id1[0], id1[1], id2[0], id2[1], None)
except Exception as e:
    pass

if not fetch_called:
    print("Fetch was not called, testing with just 2 args?")
    try:
        set_stream(store, id1[0], id1[1], id2[0], id2[1], 0, 0, None)
    except:
        pass
