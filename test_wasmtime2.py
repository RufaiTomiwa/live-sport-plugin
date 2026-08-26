import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

imports = []
for i in module.imports:
    # create a dummy function
    def make_dummy(name):
        def dummy(*args):
            # print(f"Called {name} with {args}")
            return 0
        return dummy
        
    func_type = i.type
    # print(func_type, type(func_type))
    # It might be FuncType
    if isinstance(func_type, wasmtime.FuncType):
        imports.append(wasmtime.Func(store, func_type, make_dummy(i.name)))

try:
    instance = wasmtime.Instance(store, module, imports)
    print("Instantiated!")
except Exception as e:
    print("Error:", e)
