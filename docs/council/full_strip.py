"""Full-page index capture at 1440 (motion paused) cut into one tall strip, to plan art placement. Arg: out path."""
import sys
from playwright.sync_api import sync_playwright
out = sys.argv[1] if len(sys.argv) > 1 else r'C:\dev\anar-site\docs\report\anim\full.jpg'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge'); pg = b.new_page(viewport={'width': 1440, 'height': 900})
    pg.goto('http://127.0.0.1:5173/index.html', wait_until='load'); pg.wait_for_timeout(2500)
    H = pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0, H, 600): pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(120)
    pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(800)
    info = pg.evaluate('''() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
      return {H: document.documentElement.scrollHeight, tree: r('.tree'), band: r('.tree__band'), trunk: r('.tree__trunk'), ground: r('.ground-art'),
              s2: r('.screen--statement'), s3: r('#celebrations') || r('.screen--celebrations'), acc: r('[data-accordion]'), form: r('#inquire'), s: getComputedStyle(document.querySelector('.tree')).getPropertyValue('--s')} }''')
    print(info)
    pg.screenshot(path=out, full_page=True, type='jpeg', quality=70); b.close()
