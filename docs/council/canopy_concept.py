"""Canopy version concept: one tall tree across 4 viewports (canopy bottom of p1 / top of p2, trunks p2-3, roots p4)."""
from PIL import Image, ImageDraw, ImageFont
W, H, N = 720, 450, 4
bg = (27, 34, 30); gold = (201, 158, 92); parch = (249, 246, 240)
canvas = Image.new('RGBA', (W, H * N), bg + (255,))
poster = Image.open('assets/video/hero-poster.jpg').convert('RGBA').resize((W, H))
poster = Image.alpha_composite(poster, Image.new('RGBA', (W, H), (27, 34, 30, 120)))
canvas.paste(poster, (0, 0))
tl = Image.open('assets/tree/trunk-left.webp').convert('RGBA'); tr = Image.open('assets/tree/trunk-right.webp').convert('RGBA')
th = int(H * 2.6); tw = int(tl.width * th / tl.height)
tl = tl.resize((tw, th)); tr = tr.resize((tw, th)); ty = int(H * 0.95)
canvas.alpha_composite(tl, (-tw // 3, ty)); canvas.alpha_composite(tr, (W - tw + tw // 3, ty))
roots = Image.open('assets/tree/roots-floor.webp').convert('RGBA'); rw = int(W * 1.2); rh = int(roots.height * rw / roots.width)
roots = roots.resize((rw, rh)); canvas.alpha_composite(roots, (-(rw - W) // 2, H * N - rh + 20))
can = Image.open('assets/tree/canopy-u3.webp').convert('RGBA'); cw = int(W * 1.15); ch = int(can.height * cw / can.width)
can = can.resize((cw, ch)); canvas.alpha_composite(can, (-(cw - W) // 2, int(H * 0.38)))
d = ImageDraw.Draw(canvas)
try:
    f = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 30); fs = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 14); fl = ImageFont.truetype('C:/Windows/Fonts/impact.ttf', 64)
except Exception:
    f = fs = fl = ImageFont.load_default()
d.text((W // 2, H * 0.40), 'ANAR EVENTS', font=fl, fill=gold, anchor='mm')
d.line((W * 0.3, H * 0.52, W * 0.7, H * 0.52), fill=gold, width=2)
def ghost(y0, y1, label, sub):
    d.rounded_rectangle((W * 0.28, y0, W * 0.72, y1), radius=6, outline=gold, width=2)
    d.text((W // 2, (y0 + y1) // 2 - 10), label, font=f, fill=parch, anchor='mm')
    d.text((W // 2, (y0 + y1) // 2 + 18), sub, font=fs, fill=gold, anchor='mm')
ghost(H * 1.45, H * 1.85, 'One line + 3 promises', 'short, between the trunks')
ghost(H * 2.15, H * 2.85, 'Celebrations', 'image-led, a few words each')
ghost(H * 3.15, H * 3.55, 'Inquire', 'name - email - message')
for i in range(1, N):
    d.line((0, H * i, W, H * i), fill=(201, 158, 92, 140), width=1)
labels = ['PAGE 1 - canopy at the bottom', 'PAGE 2 - canopy at the top, trunks begin', 'PAGE 3 - trunks both sides', 'PAGE 4 - the ground']
for i, t in enumerate(labels):
    d.rectangle((8, H * i + 8, 8 + 330, H * i + 32), fill=(18, 23, 20, 220)); d.text((14, H * i + 12), t, font=fs, fill=gold)
canvas.convert('RGB').save('docs/report/canopy-concept.jpg', quality=88); print('ok')
