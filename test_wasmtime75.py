import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# They pass a string to set_stream_jw
# Let's write a python function to call set_stream_jw EXACTLY how JS does.
# But wait... set_stream_jw signature in wasm:
# set_stream_jw [i32, i32, i32, i32, i32, i32] [anyref]
# Meaning it takes 3 strings (domain, arg1, arg2)!
# Yes, domain, type, id.
# Why does it crash when I call it from python with these 3 strings?
# domain = pass_string(b"https://embed.st")
# id1 = pass_string(b"admin")
# id2 = pass_string(b"admin-tennis-channel/1")
# set_stream_jw(store, domain[0], domain[1], id1[0], id1[1], id2[0], id2[1])

# The JS code is:
# function set_stream_jw(...x5lBJ_){var jt3IoMo={get...};return iXYgipw=[x5lBJ_,jt3IoMo],T59HXD("set_stream_jw")}
# Ah! JS set_stream_jw DOES NOT pass arguments to WASM set_stream_jw.
# It stores them in iXYgipw and calls T59HXD.
# Then T59HXD probably reads them, mallocs them, and calls WASM!
# But wait, T59HXD calls what? 
# "T59HXD("set_stream_jw") -> does it call WASM set_stream_jw?
# Yes! And the WASM function takes 6 ints (3 strings).
# Are the strings we passed correct?
# Let's intercept the MALLOCs!
