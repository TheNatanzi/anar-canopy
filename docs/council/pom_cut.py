"""Cut the two ground pomegranates (tree-full rows 3080-3714) into their own sprites and inpaint the plate under them,
so each can rock in place (owner 2026-11-03: the whole fruit, then "do the other pomegranate too").
Writes assets/tree/ground.webp (+768/1024), assets/tree/pom-rock.webp (whole) and assets/tree/pom-half.webp (cut half)."""
import numpy as np, cv2
from PIL import Image
SRC = r'C:\dev\anar-site\src-assets\tree\tree-full.png'; OUT = r'C:\dev\anar-site\assets\tree'; REP = r'C:\dev\anar-site\docs\report\anim'
G0 = 3080
im = np.array(Image.open(SRC).convert('RGB'))[G0:3714].copy()           # the ground plate, 1536 x 634
H, W = im.shape[:2]


def fruit_mask(x0, y0, x1, y1, cream):
    box = im[y0:y1, x0:x1].astype(int); R, Gc, B = box[..., 0], box[..., 1], box[..., 2]
    m = (R > 95) & (R > Gc * 1.55) & (R > B * 1.15)                      # the red rind / seeds
    if cream:
        m |= (R > 170) & (Gc > 130) & (B > 100) & (R - B < 110)          # the cut face's pale pith
    m = cv2.morphologyEx(m.astype(np.uint8) * 255, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m); k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    m = np.where(lab == k, 255, 0).astype(np.uint8)
    o = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))   # drop stray root / seed pixels
    n, lab, st, _ = cv2.connectedComponentsWithStats(o); k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    core = cv2.dilate(np.where(lab == k, 255, 0).astype(np.uint8), np.ones((15, 15), np.uint8)) & m   # crown tips back
    cs, _ = cv2.findContours(core, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    hull = np.zeros_like(core); cv2.fillPoly(hull, [cv2.convexHull(max(cs, key=cv2.contourArea))], 255)
    full = np.zeros((H, W), np.uint8); full[y0:y1, x0:x1] = hull
    return cv2.dilate(full, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))   # + the painted dark rim (~5px)


FRUIT = {'pom-rock': fruit_mask(535, 140, 805, 430, False),              # the whole fruit
         'pom-half': fruit_mask(806, 180, 1040, 470, True)}              # the cut half
hole = np.zeros((H, W), np.uint8)
for m in FRUIT.values():
    hole |= cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))   # the plate is repainted a bit wider

# the plate: OpenCV inpaint (Telea) over both holes. Only the outer ~12px ever shows (rocking about the contact point)
plate = cv2.cvtColor(cv2.inpaint(cv2.cvtColor(im, cv2.COLOR_RGB2BGR), hole, 9, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
P = Image.fromarray(plate)
P.save(OUT + r'\ground.webp', 'WEBP', quality=86, method=6)
for wd in (768, 1024):
    P.resize((wd, round(H * wd / W)), Image.LANCZOS).save(OUT + rf'\ground-{wd}.webp', 'WEBP', quality=86, method=6)

SPR = {}
for name, m in FRUIT.items():
    ys, xs = np.nonzero(m)
    sx0, sy0, sx1, sy1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    a = cv2.GaussianBlur(m, (5, 5), 0)                                   # a 2px feathered edge
    S = Image.fromarray(np.ascontiguousarray(np.dstack([im, a])[sy0:sy1, sx0:sx1]), 'RGBA')
    S.save(OUT + rf'\{name}.webp', 'WEBP', quality=90, method=6); SPR[name] = (S, sx0, sy0)
    print(name, 'size', S.size, 'left/top (plate px)', sx0, sy0)


def frame(degs):                                                         # both fruits rocked over the plate
    c = P.convert('RGBA')
    for (S, sx0, sy0), d in zip(SPR.values(), degs):
        c.alpha_composite(S.rotate(d, resample=Image.BICUBIC, center=(S.width / 2, S.height - 6)), (sx0, sy0))
    return c.convert('RGB').crop((470, 100, 1090, 480))


row = [P.crop((470, 100, 1090, 480))] + [frame(d) for d in ((-3, 3), (0, 0), (3, -3))]
sheet = Image.new('RGB', (630 * 2, 390 * 2), (60, 40, 30))
for i, t in enumerate(row):
    sheet.paste(t, ((i % 2) * 630, (i // 2) * 390))
sheet.save(REP + r'\pom-rock-check.jpg', quality=88)
