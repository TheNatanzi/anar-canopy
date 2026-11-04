"""Which layer paints which fruit: the right half of the canopy at 1440 (DPR 2), full and with layers hidden in turn."""
from playwright.sync_api import sync_playwright
from PIL import Image
R = r'C:\dev\anar-site\docs\report\anim'
HIDE = {'all': '', 'no-hanging': '.rig__f', 'no-front': '.rig__b--front', 'no-back': '.rig__b--back',
        'no-pieces': '.rig__p', 'only-backdrop': '.rig__b,.rig__p,.rig__limbs'}
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge'); pg = b.new_page(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)
    pg.goto('http://127.0.0.1:5173/index.html', wait_until='load'); pg.wait_for_timeout(3000)
    pg.wait_for_timeout(800)
    print(pg.evaluate("(() => ({rigOn: document.documentElement.className, canopyOpacity: getComputedStyle(document.querySelector('.tree__canopy')).opacity, canopyVis: getComputedStyle(document.querySelector('.tree__canopy')).visibility}))()"))
    pg.evaluate('window.scrollTo(0, 500)'); pg.wait_for_timeout(1200)
    for name, sel in HIDE.items():
        pg.evaluate("s => { document.querySelectorAll('[data-hid]').forEach(e => { e.style.visibility = ''; e.removeAttribute('data-hid'); }); if (s) document.querySelectorAll(s).forEach(e => { e.style.visibility = 'hidden'; e.setAttribute('data-hid', 1); }); }", sel)
        pg.wait_for_timeout(300)
        pg.screenshot(path=R + rf'\layer-{name}.jpg', type='jpeg', quality=80, clip={'x': 720, 'y': 80, 'width': 720, 'height': 820})
    b.close()
ims = [Image.open(R + rf'\layer-{n}.jpg').resize((480, 547)) for n in HIDE]
s = Image.new('RGB', (3 * 485, 2 * 552))
for i, im in enumerate(ims): s.paste(im, ((i % 3) * 485, (i // 3) * 552))
s.save(R + r'\layers-sheet.jpg', quality=85)
