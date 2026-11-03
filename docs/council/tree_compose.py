"""Compose the Canopy-version tree: tile-B (canopy..roots) with tile-A's trunk band inserted in the middle so the
painting runs ~4 viewports tall. Keys magenta, feathers the two seams, writes assets/tree/tree-full.{png,webp} + preview."""
import os, sys, numpy as np
from PIL import Image, ImageFilter
SITE = r'C:\dev\anar-site'; TI = os.path.join(SITE, 'src-assets', 'tree', 'tiles'); T = os.path.join(SITE, 'assets', 'tree')
sys.path.insert(0, os.path.join(SITE, 'docs', 'council')); from rekey import key  # noqa
A = key(os.path.join(TI, 'tile-A.png')); B = key(os.path.join(TI, 'tile-B.png'))
cutB, a0, a1, b1 = [int(x) for x in (os.environ.get('CUTS') or '1550,1250,2752,1850').split(',')]
FE = 120
top = B.crop((0, 0, B.width, cutB)); mid = A.crop((0, a0, A.width, a1)); bot = B.crop((0, b1, B.width, B.height))
def feather_join(up, down, fe=FE):
    """overlap the last fe rows of `up` with the first fe rows of `down` using a vertical alpha ramp"""
    w = up.width; out = Image.new('RGBA', (w, up.height + down.height - fe), (0, 0, 0, 0))
    out.paste(up, (0, 0))
    ramp = np.tile(np.linspace(0, 1, fe, dtype=np.float32)[:, None], (1, w))
    seam_up = np.asarray(up.crop((0, up.height - fe, w, up.height))).astype(np.float32)
    seam_dn = np.asarray(down.crop((0, 0, w, fe))).astype(np.float32)
    r = ramp[..., None]; mix = seam_up * (1 - r) + seam_dn * r
    mix[..., 3] = np.maximum(seam_up[..., 3] * (1 - ramp), seam_dn[..., 3] * ramp) * 0 + (seam_up[..., 3] * (1 - ramp) + seam_dn[..., 3] * ramp)
    out.paste(Image.fromarray(mix.astype(np.uint8), 'RGBA'), (0, up.height - fe))
    out.paste(down.crop((0, fe, w, down.height)), (0, up.height))
    return out
full = feather_join(feather_join(top, mid), bot)
full.save(os.path.join(T, 'tree-full.png'), optimize=True); full.save(os.path.join(T, 'tree-full.webp'), 'WEBP', quality=86, method=6)
prev = Image.new('RGB', full.size, (27, 34, 30)); prev.paste(full, (0, 0), full); prev = prev.resize((full.width // 3, full.height // 3))
prev.save(os.path.join(SITE, 'docs', 'report', 'tree-full-preview.jpg'), quality=85)
print('tree-full', full.size, 'webp', os.path.getsize(os.path.join(T, 'tree-full.webp')) // 1024, 'KB')
