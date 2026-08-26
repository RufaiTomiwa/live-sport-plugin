from playwright.sync_api import sync_playwright
import time

def trace_stremio():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.route("**/*", lambda route: print("REQ:", route.request.url) or route.continue_())
        
        print("Navigating...")
        try:
            page.goto("https://embed.st/embed/admin/admin-tennis-channel/1", wait_until="domcontentloaded")
        except Exception as e:
            print("Goto error:", e)
            
        time.sleep(5)
        # Try to execute window.wasm
        w = page.evaluate("typeof window.wasm")
        print("typeof window.wasm:", w)
        browser.close()

trace_stremio()
