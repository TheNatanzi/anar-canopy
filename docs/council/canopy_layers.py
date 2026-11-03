"""Canopy as 4 depth layers (back → front) so branches can move around each other (parallax + bounce).
Same gouache style as the approved canopy (reference canopy-u3). Magenta bg → keyed WebP in assets/tree/layers/.
Paid Gemini image API (Medi: no cap). Usage: canopy_layers.py [L1 L2 L3 L4]"""
import os, sys, json, base64, urllib.request, time
sys.path.insert(0, r'C:\dev\anar-site\docs\council'); from rekey import key  # noqa
from PIL import Image
SITE = r'C:\dev\anar-site'; RAW = os.path.join(SITE, 'src-assets', 'tree', 'layers'); OUT = os.path.join(SITE, 'assets', 'tree', 'layers')
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
REF = os.path.join(SITE, 'src-assets', 'tree', 'canopy-u3.png'); MODEL = 'gemini-3.1-flash-image'
STYLE = ("Painted illustration in opaque gouache exactly matching the reference painting's style (olive-green faceted leaves, glossy red "
         "pomegranates with small crowns, warm brown bark with brush strokes, soft painterly edges, no outlines). Flat solid uniform magenta "
         "#FF00FF background everywhere there is no painting. No text, no border, no sky, no ground.")
COMP = (" Landscape 16:9. This is ONE DEPTH LAYER of a pomegranate-tree canopy that will be stacked with other layers: the canopy fills the "
        "BOTTOM half of the image in a U shape (thick at the left and right sides, dipping low in the centre, the top-centre empty magenta), "
        "with two thick trunks rising at the far left and far right edges, each cut in half by the image edge. Leave many magenta GAPS between "
        "the branches so the layers behind can show through.")
JOBS = {
  'L1-back':  COMP + " BACK layer: the farthest branches — slightly darker and cooler greens, smaller leaves, only a few fruit, thinner twigs, about 40% coverage.",
  'L2-mid':   COMP + " MIDDLE-BACK layer: medium branches with medium leaves and some fruit, normal greens, about 45% coverage, different branch positions from a typical canopy so it interlocks with other layers.",
  'L3-front': COMP + " MIDDLE-FRONT layer: bolder branches, larger leaves, more pomegranates, brighter greens, about 45% coverage.",
  'L4-fore':  COMP + " FOREGROUND layer: the nearest few branches only — the largest leaves and the biggest, most detailed pomegranates, warm highlights, about 30% coverage, mostly along the bottom and the two sides.",
}
ref = base64.b64encode(open(REF, 'rb').read()).decode()
for name in (sys.argv[1:] or JOBS):
    body = {"contents": [{"parts": [{"inlineData": {"mimeType": "image/png", "data": ref}}, {"text": STYLE + JOBS[name]}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    t = time.time(); r = json.load(urllib.request.urlopen(req, timeout=300))
    for p in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            raw = os.path.join(RAW, f'{name}.png'); open(raw, 'wb').write(base64.b64decode(p["inlineData"]["data"]))
            im = key(raw); im.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=86, method=6)
            print(name, im.size, round(time.time() - t, 1), 's', os.path.getsize(os.path.join(OUT, f'{name}.webp')) // 1024, 'KB')
# preview: stacked on night
layers = [n for n in JOBS if os.path.exists(os.path.join(OUT, f'{n}.webp'))]
if layers:
    base = Image.new('RGBA', (2752, 1536), (27, 34, 30, 255))
    for n in layers: base.alpha_composite(Image.open(os.path.join(OUT, f'{n}.webp')).convert('RGBA'))
    base.convert('RGB').resize((1376, 768)).save(os.path.join(SITE, 'docs', 'report', 'canopy-layers-stack.jpg'), quality=85); print('stack preview written')
