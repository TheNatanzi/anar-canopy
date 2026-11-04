"""Owner question 2026-11-03 ("in Farsi they say maraasem, not میراث"): the hero tag line rendered with each word, side by side.
Also two hero frames 2.5 s apart (the trunk-top crowns now sway). Writes docs/report/anim/farsi-compare.jpg, crowns-*.jpg."""
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
R = r'C:\dev\anar-site\docs\report\anim'
LINES = [('میراث، از نو', 'NOW: miras, az no  =  "heritage, made new"'),
         ('مراسم، از نو', 'OPTION: marasem, az no  =  "ceremonies, made new"')]
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge'); pg = b.new_page(viewport={'width': 1440, 'height': 900})
    pg.goto('http://127.0.0.1:5173/index.html', wait_until='load'); pg.wait_for_timeout(2500)
    pg.screenshot(path=R + r'\crowns-0.jpg', type='jpeg', quality=85); pg.wait_for_timeout(2500)
    pg.screenshot(path=R + r'\crowns-1.jpg', type='jpeg', quality=85)
    shots = []
    for fa, _ in LINES:
        pg.evaluate("t => document.querySelector('.hero__tag .fa').textContent = t", fa); pg.wait_for_timeout(300)
        box = pg.evaluate("(() => { const r = document.querySelector('.hero__text').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
        f = R + rf'\farsi-{len(shots)}.png'
        pg.screenshot(path=f, clip={'x': box[0] - 30, 'y': box[1] - 10, 'width': box[2] + 60, 'height': box[3] + 20}); shots.append(f)
    b.close()
ims = [Image.open(f).convert('RGB') for f in shots]; w = max(i.width for i in ims); h = sum(i.height + 46 for i in ims)
sheet = Image.new('RGB', (w, h), (27, 34, 30)); d = ImageDraw.Draw(sheet); y = 0
try: font = ImageFont.truetype(r'C:\Windows\Fonts\segoeuib.ttf', 22)
except OSError: font = ImageFont.load_default()
for im, (_, label) in zip(ims, LINES):
    d.text((14, y + 10), label, fill=(237, 186, 108), font=font); sheet.paste(im, (0, y + 46)); y += im.height + 46
sheet.save(R + r'\farsi-compare.jpg', quality=90)
print('ok')
