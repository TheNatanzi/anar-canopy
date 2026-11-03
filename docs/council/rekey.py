"""Re-key the magenta renders with edge erosion + despill, write lossless-alpha WebP (and keep PNG), report sizes."""
import os, numpy as np
from PIL import Image, ImageFilter
SITE = r'C:\dev\anar-site'; T = os.path.join(SITE, 'assets', 'tree'); A = os.path.join(T, 'raw', 'api')
def key(src):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = np.clip(((r + b) / 2 - g) / 255, 0, 1)
    alpha = np.clip((0.55 - mag) / 0.25, 0, 1)
    # erode alpha by ~1.5px to drop the magenta rim, then soften
    al = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    alpha = np.asarray(al).astype(np.float32) / 255
    # despill: where red and blue exceed green, pull them down to green level (kills pink), keep reds for fruit (r >> b)
    fruit = (r > b + 60)
    spill = np.clip(np.minimum(r, b) - g, 0, 255); spill = np.where(fruit, 0, spill)
    r2 = r - spill; b2 = b - spill
    rgb = np.dstack([r2, g, b2]); return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
if __name__ == '__main__':
  for n in ['canopy-u3', 'trunks-tall', 'roots-floor', 'leaves-float']:
      src = next(os.path.join(A, f'{n}.{e}') for e in ('jpg', 'png') if os.path.exists(os.path.join(A, f'{n}.{e}')))
      im = key(src); im.save(os.path.join(T, f'{n}.png'), optimize=True)
      im.save(os.path.join(T, f'{n}.webp'), 'WEBP', quality=88, method=6)
      print(n, im.size, 'png', os.path.getsize(os.path.join(T, f'{n}.png')) // 1024, 'KB  webp', os.path.getsize(os.path.join(T, f'{n}.webp')) // 1024, 'KB')
