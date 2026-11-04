"""Finish-the-site audit (owner 2026-11-03 "let's move on to finishing the site"): every page at 1440 and 390, failed
requests (404s), console errors, horizontal overflow, and a top-of-page + full-page capture of each inner page."""
from playwright.sync_api import sync_playwright
from PIL import Image
R = r'C:\dev\anar-site\docs\report\finish'; import os; os.makedirs(R, exist_ok=True)
PAGES = ['index.html', 'weddings.html', 'how-we-work.html', 'about.html']
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    for vw, vh, tag in ((1440, 900, 'd'), (390, 844, 'm')):
        ctx = b.new_context(viewport={'width': vw, 'height': vh}, is_mobile=(tag == 'm'))
        for page in PAGES:
            pg = ctx.new_page(); bad, errs = [], []
            pg.on('response', lambda r: bad.append(f'{r.status} {r.url}') if r.status >= 400 else None)
            pg.on('requestfailed', lambda r: bad.append(f'FAILED {r.url}'))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(f'http://127.0.0.1:5173/{page}', wait_until='load'); pg.wait_for_timeout(2000)
            H = pg.evaluate('document.documentElement.scrollHeight')
            for y in range(0, H, 600): pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(60)
            pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(600)
            ov = pg.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')
            words = pg.evaluate("document.querySelector('main') ? document.querySelector('main').innerText.split(/\\s+/).filter(Boolean).length : 0")
            print(f'{tag} {page:16s} height {H:5d}  words {words:4d}  overflow {ov}  bad {bad[:4]}  errors {errs[:3]}')
            if tag == 'd':
                pg.screenshot(path=rf'{R}\{page[:-5]}-full.jpg', full_page=True, type='jpeg', quality=60)
                im = Image.open(rf'{R}\{page[:-5]}-full.jpg'); im.thumbnail((360, 10000)); im.save(rf'{R}\{page[:-5]}-thumb.jpg', quality=80)
            pg.close()
        ctx.close()
    b.close()
ims = [Image.open(rf'{R}\{pg[:-5]}-thumb.jpg') for pg in PAGES]
s = Image.new('RGB', (sum(i.width for i in ims) + 30, max(i.height for i in ims)), (60, 40, 30)); x = 0
for i in ims: s.paste(i, (x, 0)); x += i.width + 10
s.save(rf'{R}\all-pages.jpg', quality=80); print('sheet', s.size)
