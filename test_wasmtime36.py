import wasmtime

store = wasmtime.Store()
module = wasmtime.Module.from_file(store.engine, "lock2.wasm")

# Wait, why does it crash? Let's trace back from the Rust error string:
# 'a formatting trait implementation returned an error when the underlying stream did not'
# This is a VERY specific Rust core::fmt error!
# mt::Error is returned when formatting fails. Usually this happens if you write! to a string and it fails, which almost never happens unless there's an out-of-memory or bad UTF-8 encoding somewhere.
# Wait! This error is literally core::fmt::Error. It means ormat! or write! failed internally in Rust!
# Why would formatting fail? Maybe we passed bad pointers? 
# In __wbg_new_b5d9e2fb389fef91, ptr is 1048572 and len is 1080192 (Wait, I swapped them earlier).
# If len is 1080192, that is 1 MB of error message?
# No, we swapped them and got "a formatting trait implementation returned an error when the underlying stream did not".
# The length of that string is exactly 86 bytes.
# So __wbg_new_b5d9e2fb389fef91 takes (ptr, len). And ptr was 1048572, len was 1080192.
# Let's print exactly what it takes.
