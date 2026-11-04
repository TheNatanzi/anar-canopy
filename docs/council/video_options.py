"""Hero video replacement options (owner 2026-11-03: fix the borrowed hero footage). Free Pexels videos (Pexels license:
free for commercial use, no attribution). Builds a numbered contact sheet of their preview frames under the site's own
dark tint, with the gold logo on top, so each reads as it would in the hero. Preview frames only; no video is downloaded."""
import io, urllib.request
from PIL import Image, ImageDraw, ImageFont
OPTS = [
    ('Aerial night celebration, lit courtyard', '38804643/2026-wedding-wedding-decor-wedding-decoration-38804643'),
    ('Aerial night celebration, South Asian', '38804641/asian-wedding-38804641'),
    ('Crystal chandeliers, reception', '36546022/abstract-light-aesthetic-interior-artistic-decoration-decoration-36546022'),
    ('Reception light decorations', '36546021/abstract-light-aesthetic-interior-artistic-decoration-decoration-36546021'),
    ('White drapes and flowers, ceremony', '20697239/indian-wedding-party-reception-wedding-decoration-20697239'),
    ('Sparkling venue decor', '34223158/4k-lamplight-subject-photography-wedding-theme-34223158'),
    ('Evening dance under string lights', '32009248/pexels-photo-32009248'),
    ('Outdoor evening reception, Siena', '38298786/siena-38298786'),
    ('Riverside evening reception (drone)', '29420616/drone-shot-of-an-event-in-italy-29420616'),
]
logo = None
W, H = 560, 315
f = ImageFont.truetype(r'C:\Windows\Fonts\segoeuib.ttf', 22); fl = ImageFont.truetype(r'C:\Windows\Fonts\impact.ttf', 54)
tiles = []
for i, (label, slug) in enumerate(OPTS, 1):
    url = f'https://images.pexels.com/videos/{slug}.jpeg?cs=tinysrgb&w=800'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=30).read())).convert('RGB')
    s = max(W / im.width, H / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1))
    im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
    tint = Image.new('RGB', (W, H), (27, 34, 30)); im = Image.blend(im, tint, 0.45)    # the hero's tint, about
    d = ImageDraw.Draw(im)
    tw = d.textlength('ANAR EVENTS', font=fl); d.text(((W - tw) / 2, H * 0.36), 'ANAR EVENTS', font=fl, fill=(237, 186, 108))
    d.rectangle([0, 0, 44, 40], fill=(201, 158, 92)); d.text((12, 6), str(i), font=f, fill=(27, 34, 30))
    tiles.append((im, f'{i}. {label}'))
cols = 3; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W + (cols + 1) * 12, rows * (H + 40) + (rows + 1) * 12), (27, 34, 30)); d = ImageDraw.Draw(sheet)
for k, (im, label) in enumerate(tiles):
    x = 12 + (k % cols) * (W + 12); y = 12 + (k // cols) * (H + 52)
    sheet.paste(im, (x, y)); d.text((x, y + H + 6), label, font=f, fill=(240, 230, 213))
sheet.save(r'C:\dev\anar-site\docs\report\video-options.jpg', quality=88); print('ok', sheet.size)
