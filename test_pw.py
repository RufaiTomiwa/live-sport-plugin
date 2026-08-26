
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            extra_http_headers={'Referer': 'https://embedindia.st/'}
        )
        page = context.new_page()
        
        def handle_request(req):
            if '.m3u8' in req.url or 'api' in req.url or 'token' in req.url:
                print('[REQ]', req.url)
        
        def handle_response(res):
            if '.m3u8' in res.url:
                print('[M3U8 RESPONSE]', res.url)
            if res.status == 403:
                print('[403]', res.url)
        
        page.on('request', handle_request)
        page.on('response', handle_response)
        
        print('Navigating...')
        page.goto('https://embedindia.st/embed-noads/rally-tv', wait_until='networkidle')
        print('Title:', page.title())
        time.sleep(5)
        browser.close()

if __name__ == '__main__':
    run()
