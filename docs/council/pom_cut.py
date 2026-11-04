"""Cut the whole ground pomegranate (tree-full rows 3080-3714) into its own sprite and inpaint the plate under it,
so it can rock in place (owner 2026-11-03). Writes assets/tree/ground.webp (+768/1024) and assets/tree/pom-rock.webp."""
import numpy as np, cv2
from PIL import Image
SRC = r'C:\dev\anar-site\src-assets\tree\tree-full.png'; OUT = r'C:\dev\anar-site\assets\tree'; REP = r'C:\dev\anar-site\docs\report\anim'
G0 = 3080
im = np.array(Image.open(SRC).convert('RGB'))[G0:3714].copy()           # the ground plate, 1536 x 634
x0, y0, x1, y1 = 535, 140, 805, 430                                       # box around the whole fruit (plate coords)
box = im[y0:y1, x0:x1].astype(int); R, Gc, B = box[..., 0], box[..., 1], box[..., 2]
red = (R > 95) & (R > Gc * 1.55) & (R > B * 1.15)
m = red.astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); m = np.where(lab == k, 255, 0).astype(np.uint8)
ff = m.copy(); h, w = m.shape; cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 255); m = m | cv2.bitwise_not(ff)   # fill holes
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
full = np.zeros(im.shape[:2], np.uint8); full[y0:y1, x0:x1] = m
cv2.imwrite(REP + r'\pom-mask.png', full[y0:y1, x0:x1])
ys, xs = np.nonzero(full); print('fruit bbox', xs.min(), ys.min() + G0, xs.max(), ys.max() + G0)

# drop any stray root pixels: keep the biggest blob after a hard open, then take its convex hull (the fruit is convex;
# the notches between the crown points are sky black on sky black either way)
o = cv2.morphologyEx(full, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(o); k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
core = np.where(lab == k, 255, 0).astype(np.uint8)
core = cv2.dilate(core, np.ones((15, 15), np.uint8)) & full              # give back the crown tips the open shaved
cs, _ = cv2.findContours(core, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
hull = np.zeros_like(core); cv2.fillPoly(hull, [cv2.convexHull(max(cs, key=cv2.contourArea))], 255)
sprite_m = cv2.dilate(hull, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))   # + the painted dark rim (~5px)
hole = cv2.dilate(sprite_m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))     # the plate is repainted a bit wider
ys, xs = np.nonzero(sprite_m); print('sprite bbox', xs.min(), ys.min() + G0, xs.max(), ys.max() + G0)

# the plate: OpenCV inpaint (Telea) over the hole. Only the outer ~12px ever shows (rocking about the contact point)
plate = cv2.inpaint(cv2.cvtColor(im, cv2.COLOR_RGB2BGR), hole, 9, cv2.INPAINT_TELEA)
plate = cv2.cvtColor(plate, cv2.COLOR_BGR2RGB)
P = Image.fromarray(plate)
P.save(OUT + r'\ground.webp', 'WEBP', quality=86, method=6)
for wd in (768, 1024):
    P.resize((wd, round(634 * wd / 1536)), Image.LANCZOS).save(OUT + rf'\ground-{wd}.webp', 'WEBP', quality=86, method=6)

# the sprite: the fruit pixels with a 2px feathered edge, cropped to its box
a = cv2.GaussianBlur(sprite_m, (5, 5), 0)
sx0, sy0, sx1, sy1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
rgba = np.ascontiguousarray(np.dstack([im, a])[sy0:sy1, sx0:sx1])
S = Image.fromarray(rgba, 'RGBA'); S.save(OUT + r'\pom-rock.webp', 'WEBP', quality=90, method=6)
print('sprite', S.size, 'at plate', sx0, sy0, '| bottom centre (plate coords)', (sx0 + sx1) // 2, sy1)

# checks: the plate alone, then the sprite rocked -3 / 0 / +3 degrees over it (there must be no ghost rim)
def rocked(deg):
    base = P.convert('RGBA'); spr = S.rotate(deg, resample=Image.BICUBIC, expand=False, center=(S.width / 2, S.height - 6))
    c = base.copy(); c.alpha_composite(spr, (sx0, sy0)); return c.convert('RGB').crop((470, 100, 870, 470))
row = [P.crop((470, 100, 870, 470))] + [rocked(d) for d in (-3, 0, 3)]
sheet = Image.new('RGB', (410 * 4, 370), (60, 40, 30))
for i, t in enumerate(row):
    sheet.paste(t, (i * 410, 0))
sheet.save(REP + r'\pom-rock-check.jpg', quality=88)
