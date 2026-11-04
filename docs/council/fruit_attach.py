"""Owner 2026-11-03: "a lot of these don't look connected". Each hanging fruit (.rig__f in index.html) hangs by the top
of its stem from a point in its branch's box. This checks that point against the branch painting: it must sit on the
wood (a twig), not on a leaf or on air. --fix moves each stem top to the nearest wood pixel on the underside of a twig
(within 70 sprite px; the fruit must then hang clear below it) and removes any fruit with no twig near it.
Writes docs/report/anim/attach-check.jpg (each branch with its fruit, stem tops ringed: green = on wood, red = not)."""
import re, sys
import numpy as np, cv2
from PIL import Image, ImageDraw
SITE = r'C:\dev\anar-site'; RIG = SITE + r'\assets\tree\rig'; FIX = '--fix' in sys.argv
html = open(SITE + r'\index.html', encoding='utf8').read()
branch_re = re.compile(r'(<div class="rig__b rig__b--front" data-rig="(\w+)" style="([^"]*)"><img src="assets/tree/rig/\w+\.webp" width="(\d+)" height="(\d+)"[^>]*>)((?:<span class="rig__f".*?</span>)*)</div>')
fruit_re = re.compile(r'<span class="rig__f" style="([^"]*)"><img src="assets/tree/rig/(\w+)\.webp" width="(\d+)" height="(\d+)"[^>]*></span>')
var = lambda st, k: float(re.search(r'--' + k + r':(-?[\d.]+)', st).group(1))
tiles, new_html = [], html
for m in branch_re.finditer(html):
    head, name, bst, bw, bh, fruits = m.group(1), m.group(2), m.group(3), int(m.group(4)), int(m.group(5)), m.group(6)
    spr = np.asarray(Image.open(rf'{RIG}\{name}.webp').convert('RGBA')).astype(int)
    k = var(bst, 'w') / bw                                                # art px per sprite px
    r, g, b, a = spr[..., 0], spr[..., 1], spr[..., 2], spr[..., 3]
    wood = (a > 200) & (r > g + 12) & (r - g < 70) & (r < 170) & (g > b - 15)          # warm brown bark, not fruit red
    wood = cv2.morphologyEx(wood.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    # the underside of a twig: wood with no wood 3px below it (a fruit hangs from there)
    under = wood & ~np.roll(wood, -3, axis=0)
    canvas = Image.new('RGBA', (bw, bh), (40, 120, 200, 255)); canvas.alpha_composite(Image.fromarray(spr.astype(np.uint8), 'RGBA'))
    d = ImageDraw.Draw(canvas); out_fruits = ''
    for f in fruit_re.finditer(fruits):
        fst, fname, fw, fh = f.group(1), f.group(2), int(f.group(3)), int(f.group(4))
        x, y = var(fst, 'x') / k, var(fst, 'y') / k
        xi, yi = int(round(x)), int(round(y))
        ok = 0 <= yi < bh and 0 <= xi < bw and wood[max(0, yi - 3):yi + 4, max(0, xi - 3):xi + 4].any()
        ys, xs = np.nonzero(under); dist = np.hypot(xs - x, ys - y)
        j = int(np.argmin(dist)) if len(dist) else -1
        near = (xs[j], ys[j], dist[j]) if j >= 0 else None
        fr = Image.open(rf'{RIG}\{fname}.webp').convert('RGBA'); fwid = var(fst, 'w') / k
        frs = fr.resize((max(1, int(fwid)), max(1, int(fr.height * fwid / fr.width))))
        px = var(fst, 'px') / k
        canvas.alpha_composite(frs, (int(x - px), int(y)))
        d.ellipse([x - 8, y - 8, x + 8, y + 8], outline=(0, 255, 0) if ok else (255, 0, 0), width=3)
        verdict = 'on wood' if ok else (f'off wood; nearest twig {near[2]:.0f}px away' if near else 'no twig')
        print(f'{name:4s} {fname:7s} at sprite ({x:.0f},{y:.0f}): {verdict}')
        if FIX:
            if ok:
                out_fruits += f.group(0)
            elif near and near[2] <= 70:
                nx, ny = near[0] * k, (near[1] + 1) * k
                d.ellipse([near[0] - 8, near[1] - 8, near[0] + 8, near[1] + 8], outline=(255, 255, 0), width=3)
                fst2 = re.sub(r'--x:-?[\d.]+', f'--x:{nx:.1f}', fst); fst2 = re.sub(r'--y:-?[\d.]+', f'--y:{ny:.1f}', fst2)
                out_fruits += f.group(0).replace(fst, fst2)
                print(f'      -> moved to twig at sprite ({near[0]},{near[1]})')
            else:
                print('      -> removed')
    if FIX:
        new_html = new_html.replace(m.group(0), head + out_fruits + '</div>')
    tiles.append(canvas.convert('RGB'))
if FIX:
    open(SITE + r'\index.html', 'w', encoding='utf8').write(new_html)
W = max(t.width for t in tiles); H = sum(t.height for t in tiles)
sheet = Image.new('RGB', (W, H)); y = 0
for t in tiles: sheet.paste(t, (0, y)); y += t.height
sheet.thumbnail((1000, 3000)); sheet.save(SITE + r'\docs\report\anim\attach-check.jpg', quality=85)
