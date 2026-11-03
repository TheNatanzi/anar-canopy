"""Canopy branch rig art: a static backdrop + separately painted branches + hanging fruit, same gouache style as the
approved tree (reference tile-A). Magenta background, keyed to transparent WebP in assets/tree/rig/.
Paid Gemini image API (Medi: no cap on this project). Usage: gen_rig.py [name ...]"""
import os, sys, json, base64, urllib.request, time
sys.path.insert(0, r'C:\dev\anar-site\docs\council'); from rekey import key  # noqa
SITE = r'C:\dev\anar-site'; RAW = os.path.join(SITE, 'src-assets', 'tree', 'rig'); OUT = os.path.join(SITE, 'assets', 'tree', 'rig')
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
REF = os.path.join(SITE, 'src-assets', 'tree', 'tiles', 'tile-A.png'); MODEL = 'gemini-3.1-flash-image'
STYLE = ("Painted illustration in opaque gouache, exactly matching the reference painting's style: olive-green leaves with light and dark "
         "facets, glossy red pomegranates with small crowns, warm brown bark with visible brush strokes, soft painterly edges, no outlines. "
         "Flat solid uniform magenta #FF00FF background everywhere there is no painting. No text, no border, no sky, no ground, no shadow on the background. ")
def branch(side, shape):
    edge = 'LEFT' if side == 'L' else 'RIGHT'
    return (f"Landscape 16:9. ONE single pomegranate branch, isolated, entering from the far {edge} edge of the image at its vertical "
            f"middle (the cut end of the branch touches the {edge} edge — that is where it attaches to the tree). {shape} It reaches about "
            "60% across the image. Leaves along the whole branch, and three to five pomegranates hanging from it on short stems. Nothing else in "
            "the picture; everything else is empty flat magenta.")
JOBS = {
  'backdrop': ("Landscape 16:9. A dense pomegranate-tree canopy backdrop: thick dark olive foliage in a U shape filling the bottom 60% of the "
               "image, thick at both sides, dipping low in the centre so the top-centre is empty magenta. Darker and slightly cooler than the "
               "reference, NO fruit at all, no trunks, only leaves and small twigs, painted densely with no gaps.", '16:9'),
  'b1': (branch('L', "The branch arcs gently upward."), '16:9'),
  'b2': (branch('L', "The branch droops slightly downward, heavy with fruit."), '16:9'),
  'b3': (branch('L', "The branch is long and nearly horizontal, with a small fork near its tip."), '16:9'),
  'b4': (branch('L', "The branch is short and bushy, angled up at 30 degrees."), '16:9'),
  'b5': (branch('R', "The branch arcs gently upward."), '16:9'),
  'b6': (branch('R', "The branch droops slightly downward, heavy with fruit."), '16:9'),
  'b7': (branch('R', "The branch is long and nearly horizontal, with a small fork near its tip."), '16:9'),
  'b8': (branch('R', "The branch is short and bushy, angled up at 30 degrees."), '16:9'),
  'fruit1': ("Square. ONE single ripe pomegranate hanging straight down from a short stem with two small leaves at the top; the stem "
             "touches the TOP edge of the image at the centre. Nothing else; everything else empty flat magenta.", '1:1'),
  'fruit2': ("Square. ONE single ripe pomegranate, slightly smaller and darker red, hanging from a short curved stem with one leaf; the stem "
             "touches the TOP edge of the image at the centre. Nothing else; everything else empty flat magenta.", '1:1'),
  'fruit3': ("Square. A pair of two pomegranates hanging together from one short stem with three small leaves; the stem touches the TOP "
             "edge of the image at the centre. Nothing else; everything else empty flat magenta.", '1:1'),
}
ref = base64.b64encode(open(REF, 'rb').read()).decode()
for name in (sys.argv[1:] or JOBS):
    prompt, ar = JOBS[name]
    body = {"contents": [{"parts": [{"inlineData": {"mimeType": "image/png", "data": ref}}, {"text": STYLE + prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ar, "imageSize": "2K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    t = time.time(); r = json.load(urllib.request.urlopen(req, timeout=300))
    for p in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            raw = os.path.join(RAW, f'{name}.png'); open(raw, 'wb').write(base64.b64decode(p["inlineData"]["data"]))
            im = key(raw); im.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=88, method=6)
            print(name, im.size, round(time.time() - t, 1), 's', flush=True)
# contact sheet
from PIL import Image
names = [n for n in JOBS if os.path.exists(os.path.join(OUT, f'{n}.webp'))]
W = 460; tiles = []
for n in names:
    im = Image.open(os.path.join(OUT, f'{n}.webp')).convert('RGBA'); h = int(im.height * W / im.width); im = im.resize((W, h))
    bg = Image.new('RGB', (W, h), (27, 34, 30)); bg.paste(im, (0, 0), im); tiles.append(bg)
cols = 3; rows = (len(tiles) + cols - 1) // cols; th = max(t.height for t in tiles)
sheet = Image.new('RGB', (cols * W + (cols - 1) * 10, rows * th + (rows - 1) * 10), (60, 40, 30))
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * (W + 10), (i // cols) * (th + 10)))
sheet.save(os.path.join(SITE, 'docs', 'report', 'rig-sheet.jpg'), quality=85); print('sheet ok', len(tiles))
