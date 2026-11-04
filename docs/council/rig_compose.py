"""Canopy branch rig, step 2: compose the rig at rest in art px (tree-full: 1536 wide, canopy rows 0-1200), build the
static backdrop (assets/tree/rig/backdrop.webp, the raw backdrop scaled over the crown and masked to the approved
silhouette) and the static limbs (assets/tree/rig/limbs.webp, tree-full's trunks and big limbs), size every sprite
to its placement, write rig.json and print the HTML for index.html. Renders the rest composite next to the approved canopy for the comparison.
Usage: python docs/council/rig_compose.py [preview.jpg] [--write] [--clear]"""
import os, sys, json
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rekey import key  # noqa: E402
SITE = r'C:\dev\anar-site'; RIG = os.path.join(SITE, 'assets', 'tree', 'rig'); TREE = os.path.join(SITE, 'assets', 'tree', 'tree-full.webp')
RAW = os.path.join(SITE, 'src-assets', 'tree', 'rig')
W, H = 1536, 1200
NIGHT = (27, 34, 30)
# branches: name, layer, pivot (art px), k (art px per sprite px), rest rotation (deg, clockwise), fruit
# fruit: (sprite, x, y in the branch sprite's px where the stem top hangs, fruit width in art px)
LAYOUT = [
    # back (darker, behind the static limbs): the low pair and the right upper pair
    dict(n='b3', layer='back', X=170, Y=930, k=0.55, r=4, fruit=[]),
    dict(n='b2', layer='back', X=175, Y=860, k=0.50, r=0, fruit=[]),
    dict(n='b5', layer='back', X=1370, Y=900, k=0.55, r=-2, fruit=[]),
    dict(n='b8', layer='back', X=1370, Y=500, k=0.45, r=2, fruit=[]),
    # front (over the limbs; each cut end feathered into the bark), with the hanging fruit sprites
    dict(n='b4', layer='front', X=150, Y=620, k=0.50, r=-2, fruit=[('fruit3', 1000, 330, 80)]),
    dict(n='b7', layer='front', X=1380, Y=500, k=0.52, r=4, fruit=[('fruit1', 380, 420, 58)]),
    dict(n='b1m', layer='front', X=175, Y=700, k=0.50, r=-4, fruit=[('fruit1', 1150, 410, 58), ('fruit2', 700, 250, 80)]),
    dict(n='b6', layer='front', X=1365, Y=690, k=0.50, r=0, fruit=[('fruit1', 300, 450, 58), ('fruit3', 650, 270, 80)]),
]
BACK_BRIGHT = 0.85


RES_BRANCH, RES_FRUIT = 1.25, 2.0   # shipped sprite px per art px (the canopy itself is 1 image px per art px)
_BUILT = None


def built():
    """the cleaned sprites (rig_clean.build(), cached): (images, manifest), both keyed by name"""
    global _BUILT
    if _BUILT is None:
        from rig_clean import build
        b = build()
        _BUILT = ({n: v[0] for n, v in b.items()}, {n: v[1] for n, v in b.items()})
    return _BUILT


def build_backdrop(approved_alpha):
    """the raw backdrop U, scaled to the crown's width and stretched to its height, masked to the approved
    silhouette (opened, so no hanging fruit or stray tips; see below): it fills every gap between the branches"""
    raw = key(os.path.join(RAW, 'backdrop.png'))
    a = np.asarray(raw)[..., 3]; ys, xs = np.where(a > 40)
    raw = raw.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    top, bottom = 160, 1160
    bd = raw.resize((W, bottom - top), Image.LANCZOS)
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); canvas.paste(bd, (0, top))
    # opened first (the hanging fruit and stray leaf tips cut off the silhouette), then eroded
    m = Image.fromarray(approved_alpha).filter(ImageFilter.MinFilter(41)).filter(ImageFilter.MaxFilter(41))
    # the crown's top half: dilated 4 px, so the backdrop's own painted leafy edge draws the outline where it lies
    # inside; the underside (from row 670, blended over 150 rows): eroded 35 px, under the branches' own leaf fringe
    up = np.asarray(m.filter(ImageFilter.MaxFilter(9))).astype(np.float32)
    dn = np.asarray(m.filter(ImageFilter.MinFilter(71))).astype(np.float32)
    t = np.clip((np.arange(H, dtype=np.float32) - 670) / 150, 0, 1)[:, None]
    m = Image.fromarray((up * (1 - t) + dn * t).astype(np.uint8))
    from scipy import ndimage
    lab, n = ndimage.label(np.asarray(m) > 128)
    if n > 1:   # only the crown itself: the small islands the opening leaves under it go
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        m = Image.fromarray(np.where(lab == 1 + int(np.argmax(sizes)), np.asarray(m), 0).astype(np.uint8))
    # the underside (from row 820) ends 35 px inside the approved one, softly (blurred 12 px, not cut): the low
    # branches' own leaves and fruit draw the crown's lower edge, the backdrop only fills behind them
    mt = np.asarray(m.filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)
    mb = np.asarray(m.filter(ImageFilter.GaussianBlur(12))).astype(np.float32)
    t2 = np.clip((np.arange(H, dtype=np.float32) - 780) / 80, 0, 1)[:, None]
    m = Image.fromarray((mt * (1 - t2) + np.minimum(mt, mb) * t2).astype(np.uint8))
    arr = np.asarray(canvas).astype(np.float32)
    arr[..., 3] *= np.asarray(m).astype(np.float32) / 255
    # gone by row 1200 with the limbs (rows 1150-1200), so no leaf is cut at the junction with the band below
    arr[..., 3] *= np.clip((1200 - np.arange(H, dtype=np.float32)) / 50, 0, 1)[:, None]
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    ys = np.where(np.asarray(out)[..., 3].max(1) > 8)[0]
    y0 = int(ys.min())
    return out.crop((0, y0, W, H)), y0


def place(spr, b, m):
    """one branch (with its fruit) rotated about its pivot, on a full art canvas"""
    s = m[b['n']]; k = b['k']
    w, h = round(s['w'] * k), round(s['h'] * k)
    px, py = s['pivotX'] * k, s['pivotY'] * k
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    im = spr[b['n']].resize((w, h), Image.LANCZOS)
    if b['layer'] == 'back':
        rgb = ImageEnhance.Brightness(im.convert('RGB')).enhance(BACK_BRIGHT); rgb.putalpha(im.getchannel('A'))
        im = rgb.filter(ImageFilter.GaussianBlur(0.5))
    ox, oy = round(b['X'] - px), round(b['Y'] - py)
    layer.alpha_composite(im, (ox, oy)) if ox >= 0 and oy >= 0 else layer.paste(im, (ox, oy), im)
    for (fn, fx, fy, fw) in b['fruit']:
        fs = m[fn]; fk = fw / fs['w']
        f = spr[fn].resize((round(fs['w'] * fk), round(fs['h'] * fk)), Image.LANCZOS)
        fpx, fpy = fs['pivotX'] * fk, fs['pivotY'] * fk
        # hang vertically at rest: counter-rotate by the branch's rest angle about the stem top
        big = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        sx, sy = ox + fx * k, oy + fy * k
        big.paste(f, (round(sx - fpx), round(sy - fpy)), f)
        big = big.rotate(b['r'], resample=Image.BICUBIC, center=(sx, sy))
        layer = Image.alpha_composite(layer, big)
    return layer.rotate(-b['r'], resample=Image.BICUBIC, center=(b['X'], b['Y']))


def limbs_layer(tree):
    """the static trunks and their big limbs (and the crown's two top corners, below): tree-full's bark pixels (warm brown, not fruit-red) connected to the
    trunk bases (rows 1100-1200 at the outer columns), softened 1 px; the leaves painted over them are left out
    (the backdrop and the back branches show there). Faded out over rows 1150-1200 like the old canopy, onto the
    static bark below"""
    from scipy import ndimage
    t = np.asarray(tree).astype(np.float32)
    r, g, b, a = t[..., 0], t[..., 1], t[..., 2], t[..., 3]
    # bark: warm brown (measured on the trunks: red - green 4..36, green - blue 0..19); never within 5 px of a fruit
    # (red - green > 60), whose dark rims would otherwise ride along as red crescents on the limbs
    bark = (a > 100) & (r > g + 8) & (r - g < 45) & (g > b - 4) & (r - b > 22) & (r < 200)
    fruit = ndimage.binary_dilation((a > 60) & (r > 90) & (r - g > 60), iterations=5)
    bark = ndimage.median_filter((bark & ~fruit).astype(np.uint8), 5) > 0
    lab, _ = ndimage.label(bark)
    seeds = np.zeros_like(bark); seeds[1100:H, :200] = True; seeds[1100:H, 1340:] = True
    keep = np.unique(lab[seeds & bark]); keep = keep[keep > 0]
    m = ndimage.binary_closing(np.isin(lab, keep), iterations=2)
    mi = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32)
    # the two top corners of the crown (outside the logo's column, above the branches), as painted: the approved
    # spiky outline and the fruit clusters at the top of each trunk. Static like the trunks (nothing slides: the
    # moving branches pass over or under whole painted pixels, never through a hole)
    x = np.arange(W, dtype=np.float32); y = np.arange(H, dtype=np.float32)
    cx = np.clip(np.maximum((330 - x) / 70, (x - 1206) / 70), 0, 1)
    cy = np.clip((470 - y) / 60, 0, 1)
    corners = 255 * cx[None, :] * cy[:, None]
    # never a half-faded fruit (a ghost): each fruit (with a 3 px rim) in the corners' fade is kept whole or dropped
    # whole, by its mean weight there
    flab, nf = ndimage.label(ndimage.binary_dilation((a > 60) & (r > 90) & (r - g > 60), iterations=3))
    if nf:
        mean = ndimage.mean(corners, flab, range(1, nf + 1))
        whole = np.concatenate([[0], np.where(mean > 127, 255.0, 0.0)])
        corners = np.where(flab > 0, whole[flab], corners)
    fade = np.clip((1200 - y) / 50, 0, 1)
    out = t.copy(); out[..., 3] = np.minimum(a, np.maximum(mi, corners)) * fade[:, None]
    im = Image.fromarray(out.astype(np.uint8), 'RGBA')
    y0 = int(np.where(np.asarray(im)[..., 3].max(1) > 8)[0].min())
    return im.crop((0, y0, W, H)), y0


def compose(extra=None):
    tree = Image.open(TREE).convert('RGBA').crop((0, 0, W, H))
    spr, m = built()
    bd, by = build_backdrop(np.asarray(tree)[..., 3])
    out = Image.new('RGBA', (W, H), NIGHT + (255,))
    out.alpha_composite(bd, (0, by))
    for b in LAYOUT:
        if b['layer'] == 'back':
            out = Image.alpha_composite(out, place(spr, dict(b, r=b['r'] + (extra or {}).get(b['n'], 0)), m))
    limbs, ly = limbs_layer(tree)
    out.alpha_composite(limbs, (0, ly))
    for b in LAYOUT:
        if b['layer'] == 'front':
            out = Image.alpha_composite(out, place(spr, dict(b, r=b['r'] + (extra or {}).get(b['n'], 0)), m))
    return out, tree, bd, by, limbs, ly


def clearance(spr, m):
    """the topmost opaque row (alpha > 40) of each moving layer, anywhere and inside the logo column (x 376-1160),
    and its lowest row inside the statement column (x 460-1076)"""
    for b in LAYOUT:
        a = np.asarray(place(spr, b, m))[..., 3] > 40
        rows = np.where(a.any(1))[0]
        rc = np.where(a[:, 376:1161].any(1))[0]
        bot = np.where(a[:, 460:1077].any(1))[0]
        print('  %-4s top %4d  top in logo col %4s  bottom in statement col %4s' % (
            b['n'], rows[0] if len(rows) else -1, rc[0] if len(rc) else '-', bot[-1] if len(bot) else '-'))


def write(bd, by, limbs, ly):
    """the shipped files: backdrop + limbs (art px), each used sprite resized to its placement (branches at
    RES_BRANCH, fruit at RES_FRUIT of its largest placement), rig.json (the file sizes and pivots in file px, the
    layout in art px) and prints the HTML for index.html"""
    spr, m = built()
    bd.save(os.path.join(RIG, 'backdrop.webp'), 'WEBP', quality=84, method=6)
    limbs.save(os.path.join(RIG, 'limbs.webp'), 'WEBP', quality=86, method=6)
    sprites = [{'name': 'backdrop', 'w': bd.width, 'h': bd.height, 'pivotX': 0, 'pivotY': 0, 'side': 'none', 'top': by},
               {'name': 'limbs', 'w': limbs.width, 'h': limbs.height, 'pivotX': 0, 'pivotY': 0, 'side': 'none', 'top': ly}]
    fruit_w = {}
    for b in LAYOUT:
        for (fn, fx, fy, fw) in b['fruit']:
            fruit_w[fn] = max(fruit_w.get(fn, 0), fw)
    scale = {b['n']: b['k'] * RES_BRANCH for b in LAYOUT}
    scale.update({fn: fw * RES_FRUIT / m[fn]['w'] for fn, fw in fruit_w.items()})
    files = {}
    for n, f in scale.items():
        e = m[n]; w, h = round(e['w'] * f), round(e['h'] * f)
        spr[n].resize((w, h), Image.LANCZOS).save(os.path.join(RIG, n + '.webp'), 'WEBP', quality=86, method=6)
        files[n] = {'name': n, 'w': w, 'h': h, 'pivotX': round(e['pivotX'] * f), 'pivotY': round(e['pivotY'] * f), 'side': e['side']}
        sprites.append(files[n])
        print('%-8s %4d x %4d  %3d KB' % (n, w, h, os.path.getsize(os.path.join(RIG, n + '.webp')) // 1024))
    # (b1 itself is not placed: its mirror b1m is the fourth left branch; b1.webp stays the raw keyed render)
    layout, html = [], []
    for b in LAYOUT:
        e = m[b['n']]; k = b['k']
        w, h = round(e['w'] * k, 1), round(e['h'] * k, 1); px, py = round(e['pivotX'] * k, 1), round(e['pivotY'] * k, 1)
        fr, frs = '', []
        for (fn, fx, fy, fw) in b['fruit']:
            fe = m[fn]; fk = fw / fe['w']
            fh = round(fe['h'] * fk, 1); fpx = round(fe['pivotX'] * fk, 1)
            x, y = round(fx * k, 1), round(fy * k, 1)
            frs.append({'sprite': fn, 'x': x, 'y': y, 'w': fw, 'h': fh, 'px': fpx})
            fr += ('<span class="rig__f" style="--x:%s;--y:%s;--w:%s;--h:%s;--px:%s;--r:%sdeg">'
                   '<img src="assets/tree/rig/%s.webp" width="%d" height="%d" alt="" decoding="async"></span>'
                   % (x, y, fw, fh, fpx, -b['r'], fn, files[fn]['w'], files[fn]['h']))
        layout.append({'name': b['n'], 'layer': b['layer'], 'pivotX': b['X'], 'pivotY': b['Y'], 'w': w, 'h': h,
                       'spritePivotX': px, 'spritePivotY': py, 'rest': b['r'], 'fruit': frs})
        html.append('<div class="rig__b rig__b--%s" data-rig="%s" style="--x:%s;--y:%s;--w:%s;--h:%s;--px:%s;--py:%s;--r:%sdeg">'
                    '<img src="assets/tree/rig/%s.webp" width="%d" height="%d" alt="" decoding="async">%s</div>'
                    % (b['layer'], b['n'], b['X'], b['Y'], w, h, px, py, b['r'], b['n'], files[b['n']]['w'], files[b['n']]['h'], fr))
    json.dump({'units': 'sprites: file px; layout: art px (tree-full, 1536 wide, canopy rows 0-1200), rest in deg clockwise',
               'sprites': sprites, 'layout': layout}, open(os.path.join(RIG, 'rig.json'), 'w'), indent=1)
    print('--- html (index.html, the .rig__b elements) ---'); print('\n'.join(html)); print('---')
    print('backdrop', bd.size, 'top', by, '| limbs', limbs.size, 'top', ly)


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else None
    comp, tree, bd, by, limbs, ly = compose()
    if '--write' in sys.argv:
        write(bd, by, limbs, ly)
    if '--clear' in sys.argv:
        spr, m = built()
        clearance(spr, m)
    if out_path:
        bg = Image.new('RGBA', (W, H), NIGHT + (255,)); bg.alpha_composite(tree)
        sheet = Image.new('RGB', (W * 2 + 16, H), (120, 120, 120))
        sheet.paste(bg.convert('RGB'), (0, 0)); sheet.paste(comp.convert('RGB'), (W + 16, 0))
        sheet.save(out_path, quality=86)
        print('wrote', out_path)


if __name__ == '__main__':
    main()
