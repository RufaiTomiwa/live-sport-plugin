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
                if res_type == wasmtime.ValType.i32(): res.append(0)
                elif res_type == wasmtime.ValType.i64(): res.append(0)
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

# Dump the WHOLE memory before doing anything!
mem = global_memory.read(store, 0, global_memory.data_len(store))
import re
strings = re.findall(b"[a-zA-Z0-9., _-]{15,}", mem)
for s in strings:
    if b"error when the underlying stream" in s:
        print("FOUND:", s)
        print("At offset:", mem.find(s))

