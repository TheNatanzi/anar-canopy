"""Slice the approved canopy (top of tree-full) into 4 depth layers by tone, so they can move around each other while
stacking back to the original look. L0 = soft full base (moves least), L1 dark leaves, L2 mid leaves, L3 bright leaves + fruit.
Writes assets/tree/layers/canopy-L{0..3}.webp (2752 x ROWS, transparent) + docs/report/canopy-slices.jpg"""
import os, numpy as np
from PIL import Image, ImageFilter
SITE = r'C:\dev\anar-site'; OUT = os.path.join(SITE, 'assets', 'tree', 'layers'); os.makedirs(OUT, exist_ok=True)
ROWS = 1300
src = Image.open(os.path.join(SITE, 'src-assets', 'tree', 'tree-full.png')).convert('RGBA').crop((0, 0, 1536, ROWS))
a = np.asarray(src).astype(np.float32); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3] / 255
lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
fruit = (r > g + 40) & (r > 90)
def feather(mask):
    m = Image.fromarray((np.clip(mask, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))
    return np.asarray(m).astype(np.float32) / 255
bands = {
  'canopy-L1': feather(((lum < 0.30) & ~fruit).astype(np.float32)),
  'canopy-L2': feather(((lum >= 0.30) & (lum < 0.48) & ~fruit).astype(np.float32)),
  'canopy-L3': feather(((lum >= 0.48) | fruit).astype(np.float32)),
}
def save(name, rgb, alpha):
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8), 'RGBA')
    im.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=86, method=6); print(name, im.size, os.path.getsize(os.path.join(OUT, f'{name}.webp')) // 1024, 'KB'); return im
rgb = np.dstack([r, g, b])
# L0: whole canopy, darkened and softened, so gaps opened by motion never show the background
base = Image.fromarray(np.dstack([rgb * 0.72, al * 255]).astype(np.uint8), 'RGBA').filter(ImageFilter.GaussianBlur(1.5))
base.save(os.path.join(OUT, 'canopy-L0.webp'), 'WEBP', quality=84, method=6); print('canopy-L0', base.size)
layers = [base]
for n, m in bands.items(): layers.append(save(n, rgb, al * m))
# preview: stack + exploded
prev = Image.new('RGBA', (1536, ROWS), (27, 34, 30, 255))
for L in layers: prev.alpha_composite(L)
sheet = Image.new('RGB', (1536 * 2 + 20, ROWS // 2 * 2 + 20), (60, 40, 30))
sheet.paste(prev.convert('RGB').resize((1536, ROWS // 2)), (0, 0))
for i, L in enumerate(layers):
    t = Image.new('RGB', (768, ROWS // 4), (27, 34, 30)); s = L.resize((768, ROWS // 4)); t.paste(s, (0, 0), s)
    sheet.paste(t, (1546 + (i % 2) * 768, (i // 2) * (ROWS // 4 + 10)))
sheet.resize((sheet.width // 2, sheet.height // 2)).save(os.path.join(SITE, 'docs', 'report', 'canopy-slices.jpg'), quality=85); print('preview ok')
