from wasmtime import Store, Module, Instance, Func, FuncType, ValType, WasiConfig, Engine

def run():
    engine = Engine()
    store = Store(engine)
    module = Module.from_file(engine, "lock2.wasm")
    
    print("IMPORTS:")
    for i in module.imports:
        print(f"Module: {i.module}, Name: {i.name}")
        
    print("EXPORTS:")
    for e in module.exports:
        print(f"Name: {e.name}")

if __name__ == '__main__':
    run()
