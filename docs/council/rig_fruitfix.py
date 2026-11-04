"""Owner 2026-11-03: "make the pomegranates' art styles match" (+ the see-through fruit in the canopy).
For every canopy sprite that carries fruit (the branches, the hanging fruit, the trunk-top crowns):
  1. solid fruit: the magenta key (rekey.key) read red as half-magenta, so painted fruit came out 5-35 % see-through
     (the "ghost" fruit over the leaves). Inside each sprite's body (its alpha filled and eroded 2px), red pixels are
     made fully opaque again (their colour was never un-mixed, so it is the painted colour)
  2. one fruit palette: the red pixels are graded onto the ground pomegranate's measured colour (mean / spread per
     channel of assets/tree/pom-rock.webp, the approved painting's deep crimson), weighted by how red a pixel is, so
     the highlights and the crowns keep their light
Reads the untouched sprites from src-assets/tree/rig/pre-fruitfix/ (copied there on the first run), so it can be re-run."""
import os, shutil
import numpy as np, cv2
from PIL import Image
SITE = r'C:\dev\anar-site'; RIG = os.path.join(SITE, 'assets', 'tree', 'rig'); KEEP = os.path.join(SITE, 'src-assets', 'tree', 'rig', 'pre-fruitfix')
NAMES = ['b1m', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'fruit1', 'fruit2', 'fruit3', 'crown-l', 'crown-r']
os.makedirs(KEEP, exist_ok=True)
g = np.asarray(Image.open(os.path.join(SITE, 'assets', 'tree', 'pom-rock.webp')).convert('RGBA')).astype(np.float32)
gr = (g[..., 0] > g[..., 1] + 60) & (g[..., 0] > g[..., 2] + 25) & (g[..., 3] > 250)
MU, SD = g[gr][:, :3].mean(0), g[gr][:, :3].std(0)
print('target', MU.round(1), SD.round(1))
for n in NAMES:
    src = os.path.join(KEEP, f'{n}.webp')
    if not os.path.exists(src):
        shutil.copy2(os.path.join(RIG, f'{n}.webp'), src)
    a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    r, gg, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    gone = np.zeros(al.shape, bool)
    if n == 'b7':
        # its painted pair (sprite px x 438-645, y 256-430) is twice the size of every other fruit; erased (the fruit and
        # its rim / crowns inside the pair's hull, the leaves kept) and replaced in index.html by the standard hanging
        # pair (fruit3, 80 art px) from the same point, so the layers behind show through where it hung
        lab_in = ((r > gg + 45) & (r > b + 20) & (al > 60)).astype(np.uint8)
        lab_in = cv2.morphologyEx(lab_in, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        n_, lab, st, _ = cv2.connectedComponentsWithStats(lab_in); k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        pair = np.where(lab == k, 255, 0).astype(np.uint8)
        cs, _ = cv2.findContours(pair, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        hull = np.zeros_like(pair); cv2.fillPoly(hull, [cv2.convexHull(max(cs, key=cv2.contourArea))], 255)
        hull = cv2.dilate(hull, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) > 0
        leaf = (gg >= r - 5) & (gg > b)
        gone = hull & ~leaf
        al = np.where(gone, 0, al)
        # the leaves that hung behind the pair now float: keep only what is still joined to the branch
        n_, lab, st, _ = cv2.connectedComponentsWithStats((al > 30).astype(np.uint8))
        main_ = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        loose = (lab != main_) & (lab > 0)
        gone |= loose; al = np.where(loose, 0, al)
        a[..., 3] = al
    body = ((al > 60).astype(np.uint8)) * 255
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    ff = body.copy(); h, w = body.shape; cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 255)
    body = cv2.erode(body | cv2.bitwise_not(ff), np.ones((5, 5), np.uint8)) > 0
    red = (r > gg + 45) & (r > b + 20)
    # only whole fruit: red blobs of real size, shrunk 2px off their outline (the leaf edges' red fringe stays as it was)
    n_, lab, st, _ = cv2.connectedComponentsWithStats((red & body).astype(np.uint8))
    big = np.isin(lab, 1 + np.where(st[1:, cv2.CC_STAT_AREA] >= 120)[0])
    fix = (cv2.erode(big.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & (not n.startswith('crown'))   # the crowns come from the approved painting: never keyed, their soft edge is painted
    fix &= ~gone                                                          # never bring the erased pair back
    al2 = np.where(fix, 255, al)
    # the grade: weight 0 at r-g = 40 (pink highlights, orange crowns) to 1 at r-g >= 90 (the red body)
    wgt = np.clip((r - gg - 40) / 50, 0, 1) * (al2 > 20)
    sel = wgt > 0.9
    mu, sd = rgb[sel].mean(0), rgb[sel].std(0)
    moved = np.clip((rgb - mu) * (SD / np.maximum(sd, 1)) + MU, 0, 255)
    out = rgb * (1 - wgt[..., None]) + moved * wgt[..., None]
    Image.fromarray(np.dstack([out, al2]).astype(np.uint8), 'RGBA').save(os.path.join(RIG, f'{n}.webp'), 'WEBP', quality=88, method=6)
    print(f'{n:8s} made solid {int((fix & (al < 230)).sum()):6d} px   red mean {mu.round(0)} -> {MU.round(0)}')
