"""Single falling pomegranate leaves for the Canopy trunk screens (owner 2026-11-03: "get the rest of the tree animated").
Same gouache style as the rig (reference tile-A), magenta background keyed to transparent, trimmed. Paid Gemini image API
(Medi: no cap on this project). Writes src-assets/tree/rig/leaf-*.png and assets/tree/rig/leaf-*.webp."""
import os, sys, json, base64, urllib.request, time
sys.path.insert(0, r'C:\dev\anar-site\docs\council'); from rekey import key  # noqa
SITE = r'C:\dev\anar-site'; RAW = os.path.join(SITE, 'src-assets', 'tree', 'rig'); OUT = os.path.join(SITE, 'assets', 'tree', 'rig')
REF = os.path.join(SITE, 'src-assets', 'tree', 'tiles', 'tile-A.png'); MODEL = 'gemini-3.1-flash-image'
STYLE = ("Painted illustration in opaque gouache, exactly matching the reference painting's leaf style: olive-green leaves with light and "
         "dark facets, soft painterly edges, no outlines. Flat solid uniform magenta #FF00FF background everywhere there is no painting. "
         "No text, no border, no shadow on the background. ")
JOBS = {
  'leaf-a': "Square. ONE single long narrow pomegranate leaf, isolated, lying diagonally, with a tiny bit of stem. It fills about 60% of the image. Nothing else.",
  'leaf-b': "Square. ONE single pomegranate leaf, slightly curled and turning yellow-olive at the tip, isolated, lying almost horizontal. It fills about 60% of the image. Nothing else.",
  'leaf-c': "Square. A tiny twig with TWO small pomegranate leaves, isolated, lying diagonally. It fills about 60% of the image. Nothing else.",
}
ref = base64.b64encode(open(REF, 'rb').read()).decode()
for name in (sys.argv[1:] or JOBS):
    body = {"contents": [{"parts": [{"inlineData": {"mimeType": "image/png", "data": ref}}, {"text": STYLE + JOBS[name]}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "1K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    t = time.time(); r = json.load(urllib.request.urlopen(req, timeout=300))
    for p in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            raw = os.path.join(RAW, f'{name}.png'); open(raw, 'wb').write(base64.b64decode(p["inlineData"]["data"]))
            im = key(raw); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
            im.thumbnail((200, 200)); im.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=90, method=6)
            print(name, im.size, round(time.time() - t, 1), 's', flush=True)
