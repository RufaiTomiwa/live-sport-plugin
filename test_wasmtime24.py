import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")
global_memory = None

imports = []
for i in module.imports:
    def make_dummy(name, func_type):
        def dummy(caller, *args):
            print("Called", name, args)
            
            res = []
            for res_type in func_type.results:
                if res_type == wasmtime.ValType.i32(): res.append(1)
                elif res_type == wasmtime.ValType.i64(): res.append(1)
                elif res_type == wasmtime.ValType.f32(): res.append(0.0)
                elif res_type == wasmtime.ValType.f64(): res.append(0.0)
                elif res_type == wasmtime.ValType.externref(): res.append(None)
            
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

# No crash until we call set_stream!
# The crash __wbg_new_b5d9e2fb389fef91 (1048572, 1080192) is likely because we passed a BAD pointer or it threw an error!
# Wait! 1048572 is the start of the Data segment! Let's read it!
print("Reading memory at 1048572...")
try:
    mem = global_memory.read(store, 1048572, min(1080192, 100))
    print("String:", mem.decode('utf8', 'ignore'))
except Exception as e:
    pass

