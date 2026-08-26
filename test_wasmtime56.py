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
                    # VERY IMPORTANT: What does __wbindgen_string_get return?
                    # It returns a length, and writes a pointer to a struct.
                    # If we return a random 2 for is_undefined, then it thinks our stuff is NOT undefined.
                    # Wait, in the Python script, set_stream_jw doesn't use JS strings as input, it uses raw pointers.
                    # BUT __wbindgen_string_get is used when the Rust code tries to read a string from a JS object!
                    # For example: window.location.host -> returns JS string -> Rust reads it using __wbindgen_string_get.
                    # Our dummy __wbindgen_string_get returns 2! Which is a length of 2! 
                    # And it DOES NOT write a valid string pointer to the retptr!
                    # THIS IS WHY IT CRASHES! It tries to format a string but gets garbage pointers!
                    res.append(0) # Return 0 for string length! Or handle it properly!
                elif res_type == wasmtime.ValType.i64(): res.append(0)
                elif res_type == wasmtime.ValType.f32(): res.append(0.0)
                elif res_type == wasmtime.ValType.f64(): res.append(0.0)
                elif res_type == wasmtime.ValType.externref(): 
                    res.append({"id": name})
            
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

print("Executing set_stream_jw directly...")
set_stream_jw = instance.exports(store)["set_stream_jw"]
try:
    set_stream_jw(store, domain[0], domain[1], id1[0], id1[1], id2[0], id2[1])
except Exception as e:
    pass

mem = global_memory.read(store, 0, global_memory.data_len(store))
import re
strings = re.findall(b"[a-zA-Z0-9., _-]{15,}", mem)
for s in strings:
    if b"error when the underlying stream" in s:
        print("CRASHED AGAIN")
