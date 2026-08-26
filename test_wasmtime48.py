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

# It seems set_stream_jw immediately crashes internally.
# Why?
# "a formatting trait implementation returned an error when the underlying stream did not"
# This usually happens if you ormat! something and the buffer is full, OR if it panics inside set_stream_jw.
# What does set_stream_jw do first?
# Maybe it requires some JS global like window? We didn't even see it ask for window!
# set_stream_jw doesn't call ANY JS imports before crashing!
# Ah! It calls __wbindgen_init_externref_table and then __wbg_new_b5d9e2fb389fef91.
# Let's write a JS file and run it with Playwright, but intercept wasm and replace 
ew Error to dump memory!
