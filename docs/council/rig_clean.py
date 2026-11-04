"""Canopy branch rig, step 1: clean the painted rig sprites (src-assets/tree/rig/*.png, the magenta renders) into
trimmed transparent sprites with their pivots (build(); rig_compose.py places them, sizes them to their placement
and writes assets/tree/rig/*.webp + rig.json {name, w, h, pivotX, pivotY, side}).
  - every sprite re-keyed from its raw render (rekey.key; b7 by distance from its own flat dull-magenta background,
    which the generic key left as a faint dark rectangle), then trimmed to its alpha bounding box
  - b5: the vertical trunk strip at its far right cropped off at the branch's cut end
  - b1m: b1 mirrored (its base is on the right; the left trunk needs a fourth branch)
  - fruit1: the trunk stubs at its bottom corners cropped off (fruit + stem only)
  - fruit3: the canopy painted in its lower half cropped off (the top pair only)
  - each branch's cut end is feathered over FEATHER of its length (it melts into the bark, no sawn disc shows)
  - graded: leaves and wood onto the approved canopy's leaf tones (the fruit kept)
  - pivot = the cut end (branches: the mean row of the opaque pixels at the base edge; fruit: the top of the stem)
  - backdrop.webp is built by rig_compose.py (scaled to the crown and masked to the approved silhouette)
  - resampled to SCALE of the raw resolution (the sprites render at ~0.3-0.45 of raw in art px; 0.6 keeps >= 1.3x)
Usage: imported by rig_compose.py (python docs/council/rig_clean.py writes the unplaced sprites for inspection)"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rekey import key  # noqa: E402
SITE = r'C:\dev\anar-site'; RAW = os.path.join(SITE, 'src-assets', 'tree', 'rig'); OUT = os.path.join(SITE, 'assets', 'tree', 'rig')
SCALE = 0.6; FEATHER = 0.12


def key_flat(src):
    """b7: the background is one flat colour (std < 1): alpha from the distance to it, then un-mixed (despill)."""
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    bg = np.median(a[:200, :600].reshape(-1, 3), axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    al = np.clip((d - 22) / 45, 0, 1)
    # the fruit's pink highlights come close to the dull-magenta background: anything clearly red (red - blue > 70,
    # the background's is 42) stays opaque
    al = np.where(a[..., 0] - a[..., 2] > 70, 1.0, al)
    al = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255
    safe = np.maximum(al, 0.05)[..., None]
    fg = np.clip((a - (1 - safe) * bg) / safe, 0, 255)
    return Image.fromarray(np.dstack([fg, al * 255]).astype(np.uint8), 'RGBA')


def trim(im, thr=40):
    a = np.asarray(im)[..., 3]
    ys, xs = np.where(a > thr)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def base_pivot(im, side):
    a = np.asarray(im)[..., 3]
    w = a.shape[1]
    band = a[:, :12] if side == 'L' else a[:, w - 12:]
    ys = np.where(band.max(1) > 128)[0]
    return (0 if side == 'L' else w - 1), int(round(np.median(ys)))


def feather(im, side, frac=FEATHER):
    a = np.asarray(im).astype(np.float32).copy()
    w = a.shape[1]; n = max(4, int(w * frac))
    ramp = np.ones(w, np.float32)
    r = np.linspace(0, 1, n) ** 0.8
    if side == 'L':
        ramp[:n] = r
    else:
        ramp[w - n:] = r[::-1]
    a[..., 3] *= ramp[None, :]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


# the approved canopy's leaf tones (tree-full, rows 0-1200, alpha > 200 and green >= red - 5): the sprites were
# painted lighter and more saturated; their leaves and wood are graded onto these, the fruit (red) is kept
LEAF_MU = np.array([62.7, 60.0, 49.4], np.float32); LEAF_SD = np.array([19.5, 19.3, 16.4], np.float32)


def grade(im):
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    leaf = (al > 200) & (g >= r - 5) & (g > b)
    mu, sd = rgb[leaf].mean(0), rgb[leaf].std(0)
    moved = (rgb - mu) * (LEAF_SD / sd) + LEAF_MU
    # the leaves (green >= red) take the grade in full; the wood (red > green, warm brown) keeps its hue and is only
    # darkened a little (graded with the leaves it went a muddy purple); the fruit (red >> green) is untouched
    w = np.clip((g - r + 18) / 18, 0, 1)[..., None]
    wood = ((r > g) & (r - g < 70))[..., None]
    out = np.clip(np.where(wood & (w < 1), rgb * 0.82, rgb) * (1 - w) + moved * w, 0, 255)
    return Image.fromarray(np.dstack([out, al]).astype(np.uint8), 'RGBA')


def stem_pivot(im):
    a = np.asarray(im)[..., 3]
    top = np.where(a.max(1) > 128)[0][0]
    xs = np.where(a[top:top + 6].max(0) > 128)[0]
    return int(round(xs.mean())), int(top)


def build():
    """the cleaned sprites in memory, at SCALE of the raw resolution: {name: (RGBA image, manifest entry)}"""
    raw = {}
    for n in ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b8', 'fruit1', 'fruit2', 'fruit3']:
        raw[n] = key(os.path.join(RAW, n + '.png'))
    raw['b7'] = key_flat(os.path.join(RAW, 'b7.png'))
    # b7's fruit came out with a purple cast (painted against the dull magenta): the blue of its red pixels is
    # pulled halfway back to their green, the canopy fruit's balance (tree-full fruit: blue - green = 14)
    a = np.asarray(raw['b7']).astype(np.float32)
    red = (a[..., 0] - a[..., 1] > 50) & (a[..., 2] > a[..., 1])
    a[..., 2] = np.where(red, a[..., 1] + 0.45 * (a[..., 2] - a[..., 1]), a[..., 2])
    raw['b7'] = Image.fromarray(a.astype(np.uint8), 'RGBA')
    # b5: the trunk strip (the columns in the right 300 px opaque over > 90 % of the height) cropped off at the
    # branch's cut end
    a = np.asarray(raw['b5'])[..., 3]
    cov = (a > 128).mean(0)
    x0 = a.shape[1] - 300
    strip = x0 + int(np.where(cov[x0:] > 0.9)[0].min())
    b5 = raw['b5'].crop((0, 0, strip - 6, raw['b5'].height))
    # the strip's edge is not quite vertical: slivers of it remain in the last columns above and below the branch,
    # so the rows are cut to the branch's own extent (measured without the last 60 columns)
    a = np.asarray(b5)[..., 3][:, :-60]
    ys = np.where(a.max(1) > 40)[0]
    raw['b5'] = b5.crop((0, int(ys.min()), b5.width, int(ys.max()) + 1))
    # fruit1: the fruit + stem only (the trunk stubs sit in the bottom corners, below / outside the fruit)
    f = raw['fruit1']; a = np.asarray(f)[..., 3]
    cx = f.width // 2
    col = a[:, cx - 300:cx + 300]
    rows = np.where(col.max(1) > 128)[0]
    # the fruit ends where the centre column first goes empty after the fruit body
    occ = col.max(1) > 128
    body_end = rows[0]
    while body_end < len(occ) and (occ[body_end] or occ[min(len(occ) - 1, body_end + 1)]):
        body_end += 1
    raw['fruit1'] = f.crop((cx - 520, 0, cx + 520, body_end + 8))
    # fruit3: the top pair only: from the top to the first row where the canopy below starts (the centre band goes
    # empty between the pair's crowns and the painted canopy)
    f = raw['fruit3']; a = np.asarray(f)[..., 3]
    cx = f.width // 2
    col = a[:, cx - 360:cx + 360]
    occ = col.max(1) > 128
    y = 0
    while y < len(occ) and occ[y]:
        y += 1
    raw['fruit3'] = f.crop((cx - 420, 0, cx + 420, y + 4))
    raw['b1m'] = raw['b1'].transpose(Image.FLIP_LEFT_RIGHT)

    sides = {'b1': 'R', 'b1m': 'L', 'b2': 'L', 'b3': 'L', 'b4': 'L', 'b5': 'R', 'b6': 'R', 'b7': 'R', 'b8': 'R'}
    out = {}
    for n, im in raw.items():
        im = grade(trim(im))
        w, h = int(round(im.width * SCALE)), int(round(im.height * SCALE))
        im = im.resize((w, h), Image.LANCZOS)
        if n in sides:
            px, py = base_pivot(im, sides[n]); side = sides[n]
            im = feather(im, side)
        else:
            px, py = stem_pivot(im); side = 'T'
        out[n] = (im, {'name': n, 'w': w, 'h': h, 'pivotX': px, 'pivotY': py, 'side': side})
    return out


def main():
    """inspection only: writes the cleaned sprites at SCALE (rig_compose.py --write writes the shipped ones, sized
    to their placement)"""
    for n, (im, e) in build().items():
        im.save(os.path.join(OUT, n + '.webp'), 'WEBP', quality=86, method=6)
        print(e)


if __name__ == '__main__':
    main()
