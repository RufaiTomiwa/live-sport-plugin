from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
    page = context.new_page()
    
    events = []
    page.on("request", lambda req: events.append("REQ " + req.url))
    page.on("response", lambda res: events.append("RES " + res.url))
    
    page.goto('https://embed.st/embed/admin/admin-tennis-channel/1', referer="https://vidsrc.to/")
    page.wait_for_timeout(10000)
    
    for e in events:
        print(e)
        
    browser.close()
