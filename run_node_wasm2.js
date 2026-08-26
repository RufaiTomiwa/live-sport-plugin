const fs = require('fs');

async function run() {
    const wasmBuffer = fs.readFileSync('lock.wasm');
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    
    // We already have the full list of imports from Playwright output:
    const importNames = [
        "__wbg___wbindgen_boolean_get_bbbb1c18aa2f5e25", "__wbg___wbindgen_is_function_0095a73b8b156f76", "__wbg___wbindgen_is_null_ac34f5003991759a", "__wbg___wbindgen_is_undefined_9e4d92534c42d778", "__wbg___wbindgen_number_get_8ff4255516ccad3e", "__wbg___wbindgen_string_get_72fb696202c56729", "__wbg___wbindgen_throw_be289d5034ed271b", "__wbg__wbg_cb_unref_d9b87ff7982e3b21", "__wbg_appendChild_dea38765a26d346d", "__wbg_arrayBuffer_bb54076166006c39", "__wbg_body_f67922363a220026", "__wbg_call_389efe28435a9388", "__wbg_call_4708e0c13bdc8e95", "__wbg_call_812d25f1510c13c8", "__wbg_call_e8c868596c950cf6", "__wbg_construct_86626e847de3b629", "__wbg_createElement_49f60fdcaae809c8", "__wbg_defaultView_979b3a6d37a30a3a", "__wbg_document_ee35a3d3ae34ef6c", "__wbg_eval_3f0b9f0cbaf45a34", "__wbg_fetch_e6e8e0a221783759", "__wbg_getElementById_e34377b79d7285f6", "__wbg_get_941633a1d2f510cb", "__wbg_get_b3ed3ad4be2bc8ac", "__wbg_headers_59a2938db9f80985", "__wbg_headers_5a897f7fee9a0571", "__wbg_id_ff64a5892a30d4e9", "__wbg_instanceof_Document_50f5ff170c1a7826", "__wbg_instanceof_Promise_0094681e3519d6ec", "__wbg_instanceof_Response_ee1d54d79ae41977", "__wbg_instanceof_Window_ed49b2db8df90359", "__wbg_length_32ed9a279acd054c", "__wbg_navigator_43be698ba96fc088", "__wbg_new_361308b2356cecd0", "__wbg_new_3eb36ae241fe6f44", "__wbg_new_b5d9e2fb389fef91", "__wbg_new_dd2b680c8bf6ae29", "__wbg_new_from_slice_a3d2629dc1826784", "__wbg_new_no_args_1c7c842f08d00ebb", "__wbg_new_with_str_and_init_a61cbc6bdef21614", "__wbg_of_f915f7cd925b21a5", "__wbg_ok_87f537440a0acf85", "__wbg_prototypesetcall_bdcdcc5842e4d77d", "__wbg_push_8ffdcb2063340ba5", "__wbg_querySelector_c3b0df2d58eec220", "__wbg_queueMicrotask_0aa0a927f78f5d98", "__wbg_queueMicrotask_5bb536982f78a56f", "__wbg_remove_31c39325eee968fc", "__wbg_resolve_002c4b7d9d8f6b64", "__wbg_setAttribute_cc8e4c8a2a008508", "__wbg_set_6cb8631f80447a67", "__wbg_set_body_9a7e00afe3cfe244", "__wbg_set_db769d02949a271d", "__wbg_set_id_9b8330f661385753", "__wbg_set_method_c3e20375f5ae7fac", "__wbg_set_mode_b13642c312648202", "__wbg_set_textContent_3e87dba095d9cdbc", "__wbg_static_accessor_GLOBAL_12837167ad935116", "__wbg_static_accessor_GLOBAL_THIS_e628e89ab3b1c95f", "__wbg_static_accessor_SELF_a621d3dfbb60d0ce", "__wbg_static_accessor_WINDOW_f8727f0cf888e0bd", "__wbg_text_083b8727c990c8c0", "__wbg_then_0d9fe2c7b1857d32", "__wbg_then_b9e7b3b5f1a9e1b5", "__wbg_userAgent_34463fd660ba4a2a", "__wbindgen_cast_0000000000000001", "__wbindgen_cast_0000000000000002", "__wbindgen_cast_0000000000000003", "__wbindgen_cast_0000000000000004", "__wbindgen_init_externref_table"
    ];
    
    const imports = {
        './locked_bg.js': {}
    };
    
    // We can read strings from WASM memory using the pointer and length.
    let memObj = null;
    function getStr(ptr, len) {
        if (!memObj) return '???';
        return Buffer.from(memObj.buffer, ptr, len).toString('utf8');
    }
    
    importNames.forEach(name => {
        imports['./locked_bg.js'][name] = function(...args) {
            console.log('Called:', name, args);
            // Check if it's __wbg_new_with_str_and_init_a61cbc6bdef21614 (URL?)
            if (name === '__wbg_new_with_str_and_init_a61cbc6bdef21614') {
                console.log('String:', getStr(args[0], args[1]));
            }
            // Check headers, fetch, etc
            if (name === '__wbg_fetch_e6e8e0a221783759') {
                console.log('Fetch URL:', getStr(args[1], args[2]));
            }
            return 0;
        }
    });
    
    try {
        const instance = await WebAssembly.instantiate(wasmModule, imports);
        memObj = instance.exports.memory;
        
        // We know we can call init_wasm, then set_stream.
        // Let's call set_stream with fake arguments.
        // It takes a string?
        console.log('Calling set_stream...');
        try {
            // Need to allocate a string in WASM memory? No, we can just pass 0 for pointer.
            instance.exports.set_stream(0, 0); 
        } catch(e) {
            console.log('set_stream error:', e.message);
        }
        
    } catch (e) {
        console.log('Error:', e);
    }
}
run();
