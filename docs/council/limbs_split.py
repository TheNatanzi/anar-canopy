"""Split the static rig layer (assets/tree/rig/limbs.webp: both trunks, the four bare limbs, the two leafy crowns at the
trunk tops) into a static trunk layer + six moving pieces (owner 2026-11-03: "did you do the rest of the tree branches?").
Each piece = a polygon of the layer, feathered 6px at its cut; the static layer keeps an 8px overlap under every cut, so
a turned piece never opens a gap at the trunk. Writes assets/tree/rig/limbs-static.webp + limb-*.webp and prints the
HTML (art px: the layer sits at art row 168)."""
import numpy as np, cv2
from PIL import Image
RIG = r'C:\dev\anar-site\assets\tree\rig'; REP = r'C:\dev\anar-site\docs\report\anim'; TOP = 168
L = np.array(Image.open(RIG + r'\limbs.webp').convert('RGBA')); H, W = L.shape[:2]
# name: (polygon in layer px, pivot = where it leaves the trunk, layer px)
PIECES = {
    'crown-l': ([(0, 0), (345, 0), (345, 282), (0, 282)], (88, 282)),
    'crown-r': ([(1190, 0), (1536, 0), (1536, 290), (1190, 290)], (1445, 290)),
    'limb-l1': ([(150, 335), (540, 335), (540, 612), (150, 612)], (150, 545)),
    'limb-l2': ([(200, 600), (600, 600), (600, 830), (200, 830)], (200, 790)),
    'limb-r1': ([(1030, 372), (1330, 372), (1330, 408), (1410, 408), (1410, 632), (1030, 632)], (1410, 560)),
    'limb-r2': ([(925, 640), (1385, 640), (1385, 935), (925, 935)], (1385, 805)),
}
static_a = L[..., 3].astype(np.float32)
out = []
for name, (poly, (px, py)) in PIECES.items():
    hard = np.zeros((H, W), np.uint8); cv2.fillPoly(hard, [np.array(poly, np.int32)], 255)
    soft = cv2.GaussianBlur(cv2.erode(hard, np.ones((7, 7), np.uint8)), (0, 0), 3).astype(np.float32) / 255   # piece: fades in over its cut
    keep = 1 - cv2.erode(hard, np.ones((17, 17), np.uint8)).astype(np.float32) / 255                     # static: keeps 8px under the cut
    static_a *= keep
    a = (L[..., 3] * soft).astype(np.uint8)
    ys, xs = np.nonzero(a > 6); x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    Image.fromarray(np.ascontiguousarray(np.dstack([L[..., :3], a])[y0:y1, x0:x1]), 'RGBA').save(RIG + rf'\{name}.webp', 'WEBP', quality=88, method=6)
    out.append(f'      <div class="rig__p" data-p="{name}" style="--x:{px};--y:{py + TOP};--w:{x1 - x0};--h:{y1 - y0};--px:{px - x0};--py:{py - y0}">'
               f'<img src="assets/tree/rig/{name}.webp" width="{x1 - x0}" height="{y1 - y0}" alt="" loading="lazy" decoding="async"></div>')
S = np.dstack([L[..., :3], static_a.astype(np.uint8)])
Image.fromarray(S, 'RGBA').save(RIG + r'\limbs-static.webp', 'WEBP', quality=88, method=6)
print('\n'.join(out))
# check: static layer alone (blue) | pieces turned ±2° over it (3x the live sway: any gap at a cut shows here)
def comp(deg):
    bg = Image.new('RGBA', (W, H), (40, 120, 200, 255)); bg.alpha_composite(Image.fromarray(S, 'RGBA'))
    for i, (name, (poly, (px, py))) in enumerate(PIECES.items()):
        spr = Image.open(RIG + rf'\{name}.webp'); line = out[i]
        x0 = px - int(line.split('--px:')[1].split(';')[0]); y0 = py - int(line.split('--py:')[1].split('"')[0])
        lay = Image.new('RGBA', (W, H)); lay.paste(spr, (x0, y0))
        bg.alpha_composite(lay.rotate(deg * (1 if i % 2 else -1), resample=Image.BICUBIC, center=(px, py)))
    return bg.convert('RGB').resize((W // 2, H // 2))
st = Image.new('RGBA', (W, H), (40, 120, 200, 255)); st.alpha_composite(Image.fromarray(S, 'RGBA'))
sheet = Image.new('RGB', (W, H), (0, 0, 0))
for i, t in enumerate([st.convert('RGB').resize((W // 2, H // 2)), comp(0), comp(-2), comp(2)]):
    sheet.paste(t, ((i % 2) * (W // 2), (i // 2) * (H // 2)))
sheet.save(REP + r'\limbs-split-check.jpg', quality=85)
