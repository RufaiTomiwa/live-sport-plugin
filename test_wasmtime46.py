import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")
global_memory = None

imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            res = []
            for res_type in func_type.results:
                if res_type == wasmtime.ValType.i32(): res.append(2)
                elif res_type == wasmtime.ValType.i64(): res.append(2)
                elif res_type == wasmtime.ValType.f32(): res.append(0.0)
                elif res_type == wasmtime.ValType.f64(): res.append(0.0)
                elif res_type == wasmtime.ValType.externref(): res.append({"id": name})
            
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

# The static string is at 1082336. 
# Let's intercept ALL calls and see if there is ANY crypto operation BEFORE it crashes!
import json
trace_file = open("trace.txt", "w")

def trace_import(name, func_type):
    def dummy(caller, *args):
        # We know it crashes in __wbg_new_b5d9e2fb389fef91
        if "new_b5d9e2fb389fef91" in name:
            trace_file.write(f"CRASH HERE: {name} {args}\n")
        else:
            trace_file.write(f"{name} {args}\n")
        
        # Keep our mock objects
        res = []
        for res_type in func_type.results:
            if res_type == wasmtime.ValType.i32(): res.append(1) # Try 1 instead of 2? No let's try 0.
            elif res_type == wasmtime.ValType.i64(): res.append(0)
            elif res_type == wasmtime.ValType.f32(): res.append(0.0)
            elif res_type == wasmtime.ValType.f64(): res.append(0.0)
            elif res_type == wasmtime.ValType.externref(): 
                # Very important mocks!
                if "window" in name:
                    res.append({"mock": "window"})
                elif "document" in name:
                    res.append({"mock": "document"})
                else:
                    res.append({"mock": name})
        
        if len(res) == 0: return None
        elif len(res) == 1: return res[0]
        else: return tuple(res)
    return dummy

imports = []
for i in module.imports:
    func_type = i.type
    if isinstance(func_type, wasmtime.FuncType):
        imports.append(wasmtime.Func(store, func_type, trace_import(i.name, func_type), access_caller=True))

instance = wasmtime.Instance(store, module, imports)
global_memory = instance.exports(store)["memory"]
if "__wbindgen_start" in instance.exports(store):
    instance.exports(store)["__wbindgen_start"](store)

malloc = instance.exports(store)["__wbindgen_malloc"]
init_wasm = instance.exports(store)["init_wasm"]
init_wasm(store)

domain = pass_string(b"embed.st")
id1 = pass_string(b"admin")
id2 = pass_string(b"admin-tennis-channel/1")

set_stream_jw = instance.exports(store)["set_stream_jw"]
try:
    set_stream_jw(store, domain[0], domain[1], id1[0], id1[1], id2[0], id2[1])
except: pass

trace_file.close()
