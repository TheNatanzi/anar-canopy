"""A WHOLE pomegranate for the favicon (owner 2026-11-03: "we need a favicon, use the pomegranate ... make it whole, it has
some cut parts"). Painted by the Gemini image API in the ground fruit's exact style (reference: the ground fruit
crop from tree-full), on flat magenta, keyed by distance to magenta (the old key read red as half-magenta), trimmed.
Writes src-assets/tree/pom-whole.png (raw), assets/tree/pom-whole.webp, and 3 candidates to pick from."""
import os, json, base64, urllib.request, io
import numpy as np
from PIL import Image
SITE = r'C:\dev\anar-site'; RAW = SITE + r'\src-assets\tree'; MODEL = 'gemini-3.1-flash-image'
ref = Image.open(RAW + r'\tree-full.png').convert('RGB').crop((520, 3220, 820, 3520))
buf = io.BytesIO(); ref.save(buf, 'PNG'); REF = base64.b64encode(buf.getvalue()).decode()
PROMPT = ("Square image. Paint ONE single complete pomegranate in exactly the reference painting's style: opaque gouache, deep crimson "
          "rind with soft painterly brush strokes, one glossy pale highlight upper right, a small dark crimson outline, its crown of "
          "pointed sepals on top. The WHOLE fruit is visible: round bottom, nothing cut off, no ground, no leaves, no shadow. "
          "Centered, filling about 75% of the image. Flat solid uniform magenta #FF00FF background everywhere else. No text.")
def key(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    d = np.sqrt((a[..., 0] - 255) ** 2 + (a[..., 1] - 0) ** 2 + (a[..., 2] - 255) ** 2)
    al = np.clip((d - 70) / 60, 0, 1)
    # un-mix the magenta from the soft edge pixels
    safe = np.maximum(al, 0.05)[..., None]
    fg = np.clip((a - (1 - safe) * np.array([255, 0, 255])) / safe, 0, 255)
    out = Image.fromarray(np.dstack([fg, al * 255]).astype(np.uint8), 'RGBA')
    return out.crop(out.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
cands = []
for i in range(3):
    body = {"contents": [{"parts": [{"inlineData": {"mimeType": "image/png", "data": REF}}, {"text": PROMPT}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "1K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    r = json.load(urllib.request.urlopen(req, timeout=300))
    for p in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            raw = Image.open(io.BytesIO(base64.b64decode(p["inlineData"]["data"])))
            raw.save(RAW + rf'\pom-whole-{i + 1}.png'); k = key(raw); k.save(SITE + rf'\docs\report\finish\pom-whole-{i + 1}.png'); cands.append(k)
            print('candidate', i + 1, k.size, flush=True)
# sheet: each candidate on night and at favicon sizes (64 / 32 / 16 px)
NIGHT = (27, 34, 30)
sheet = Image.new('RGB', (3 * 420, 520), (60, 40, 30))
for i, k in enumerate(cands):
    big = k.copy(); big.thumbnail((380, 380)); tile = Image.new('RGB', (400, 400), NIGHT); tile.paste(big, ((400 - big.width) // 2, (400 - big.height) // 2), big)
    sheet.paste(tile, (10 + i * 420, 10))
    x = 10 + i * 420
    for s in (64, 32, 16):
        t = k.copy(); t.thumbnail((s, s), Image.LANCZOS); c = Image.new('RGB', (s, s), NIGHT); c.paste(t, ((s - t.width) // 2, (s - t.height) // 2), t)
        sheet.paste(c, (x, 430)); x += s + 20
sheet.save(SITE + r'\docs\report\finish\pom-whole-sheet.jpg', quality=90); print('sheet ok')
