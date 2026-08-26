from playwright.sync_api import sync_playwright
import time

def trace_stremio():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Pretend we are NOT headless! And NO sandbox!
        # wait! we should intercept the HTML to remove the sandbox check.
        # But wait, Stremio says: "Remove sandbox attributes on the iframe tag"
        # It detects if it is running inside a sandboxed iframe.
        # Let's bypass it.
