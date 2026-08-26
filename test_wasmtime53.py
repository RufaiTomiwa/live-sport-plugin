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
                if res_type == wasmtime.ValType.i32(): 
                    # VERY IMPORTANT: __wbindgen_object_drop_ref expects nothing, but is_function expects boolean, etc!
                    if "is_function" in name: res.append(1)
                    else: res.append(2)
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

# It's crashing due to formatting trait. This means ormat! or .to_string() on something failed inside Rust.
# Why? Was our domain pointer corrupt?
# Let's allocate differently, using ealloc or something?
# No, pass_string works exactly how wasm-bindgen handles strings!
# Let's write the string with a null terminator? Rust strings are NOT null terminated, they use the length argument!
# Let's see if we pass length correctly! Yes! len(s)
# Maybe dmin-tennis-channel/1 is NOT the right ID format?
# In playwright trace: REQ: https://embed.st/embed/admin/admin-tennis-channel/1
# Stremio trace: "has set_stream: False" -> Why was 	ypeof window.wasm: undefined?
# Because Stremio uses a DIFFERENT script!
