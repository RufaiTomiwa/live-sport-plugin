from playwright.sync_api import sync_playwright
import time

def intercept_set_stream():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.add_init_script('''
            window.interceptedArgs = null;
            Object.defineProperty(window, 'wasm', {
                get() { return window._wasm; },
                set(v) {
                    if (v && v.set_stream) {
                        const original = v.set_stream;
                        v.set_stream = function(...args) {
                            window.interceptedArgs = args;
                            console.log("INTERCEPTED set_stream!", args);
                            return original.apply(this, args);
                        };
                    }
                    if (v && v.set_stream_jw) {
                        const original = v.set_stream_jw;
                        v.set_stream_jw = function(...args) {
                            window.interceptedArgsJw = args;
                            console.log("INTERCEPTED set_stream_jw!", args);
                            return original.apply(this, args);
                        };
                    }
                    window._wasm = v;
                }
            });
        ''')
        
        page.on("console", lambda msg: print(f"Browser: {msg.text}"))
        
        print("Navigating...")
        try:
            # Let's try the full iframe URL from stremio/cloudflare
            page.goto("https://embed.st/embed/admin/admin-tennis-channel/1")
        except Exception as e:
            print("Goto error:", e)
            
        time.sleep(5)
        # Maybe they use mbed.st/embed/... ?
        
        args = page.evaluate("window.interceptedArgs || window.interceptedArgsJw || 'NOTHING'")
        print("Intercepted Args:", args)
        browser.close()

intercept_set_stream()
