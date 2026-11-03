"""Canopy version: paint the tree as ONE continuous artwork in two tall tiles (A: canopy + upper trunks,
B: lower trunks + roots/ground, generated with A as the reference so the trunks join). Paid Gemini image API,
approved by Medi 2026-11-03 ("no cap on this project"). Usage: tree_tiles.py A|B [model]"""
import os, sys, json, base64, urllib.request, time
SITE = r'C:\dev\anar-site'; OUT = os.path.join(SITE, 'src-assets', 'tree', os.environ.get('TILEDIR', 'tiles')); os.makedirs(OUT, exist_ok=True)
which = sys.argv[1]; MODEL = sys.argv[2] if len(sys.argv) > 2 else 'gemini-3.1-flash-image'
STYLE = ("Painted illustration in opaque gouache style, exactly matching the reference painting: the same olive-green leaves with "
         "light and dark facets, the same glossy red pomegranates with small crowns, the same warm brown bark with visible brush strokes, "
         "soft painterly edges, no outlines, no photo realism. The background is one flat, solid, uniform magenta #FF00FF everywhere "
         "there is no tree. Nothing else: no text, no border, no sky, no vignette.")
if which == 'A':
    ref = os.path.join(SITE, 'src-assets', 'tree', 'canopy-u3.png')
    prompt = (STYLE + " Tall portrait composition. In the TOP HALF a dense pomegranate-tree canopy spans the full width in a U shape: "
              "thick and full at both sides and across the bottom of the canopy, dipping low in the centre so the top-centre of the image "
              "stays empty magenta. From the canopy, two THICK tree trunks grow straight DOWN, one at the far LEFT edge and one at the far "
              "RIGHT edge, each trunk cut in half by the image edge, with a few short side branches carrying leaves and one or two fruit. "
              "The trunks run all the way off the BOTTOM edge of the image (they continue below). The whole centre between the trunks is "
              "empty magenta. No ground, no roots.")
    parts = [{"inlineData": {"mimeType": "image/png", "data": base64.b64encode(open(ref, 'rb').read()).decode()}}, {"text": prompt}]
else:
    ref = os.path.join(OUT, 'tile-A.png')
    prompt = (STYLE + " This is the LOWER continuation of the reference painting. At the TOP edge of the new image the two trunks must "
              "line up exactly with where they leave the BOTTOM edge of the reference: same horizontal positions at the far left and far "
              "right edges, same thickness, same bark colours and brush strokes, each still cut in half by the image edge. The trunks "
              "continue straight down through the upper 60% of the image with a few bare twigs and a leaf or two, then flare into thick "
              "roots that spread inward across the bottom quarter into a painted ground: dark soil, tufts of grass, a few fallen "
              "pomegranates, one split open, and scattered red seeds. The ground band runs the full width along the bottom edge. The centre "
              "above the ground stays empty magenta.")
    parts = [{"inlineData": {"mimeType": "image/png", "data": base64.b64encode(open(ref, 'rb').read()).decode()}}, {"text": prompt}]
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16", "imageSize": os.environ.get("IMGSIZE", "2K")}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent", data=json.dumps(body).encode(),
                             headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
t = time.time(); r = json.load(urllib.request.urlopen(req, timeout=300))
for p in r["candidates"][0]["content"]["parts"]:
    if "inlineData" in p:
        data = base64.b64decode(p["inlineData"]["data"]); ext = "png" if "png" in p["inlineData"]["mimeType"] else "jpg"
        path = os.path.join(OUT, f"tile-{which}.{ext}"); open(path, "wb").write(data)
        if ext != 'png':
            from PIL import Image; Image.open(path).save(os.path.join(OUT, f"tile-{which}.png"));
        print('tile', which, len(data) // 1024, "KB", round(time.time() - t, 1), "s, tokens", r.get("usageMetadata", {}).get("totalTokenCount"))
