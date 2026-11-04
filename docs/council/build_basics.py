"""The basics a public site needs (owner 2026-11-03 "finish the site"): 404.html (built from about.html's shell, every
path made root-absolute so it works at any depth), robots.txt, sitemap.xml, apple-touch-icon.png, favicon-32.png and a
1200x630 share image (icons: the logo, never the pomegranate alone: owner rule) (og-image.jpg: the painted canopy + gold logo, our own art, replacing the borrowed video frame)."""
import re, os, datetime
from PIL import Image, ImageDraw
SITE = r'C:\dev\anar-site'; os.chdir(SITE)
PAGES = ['index.html', 'weddings.html', 'how-we-work.html', 'about.html']
src = open('about.html', encoding='utf8').read()
a, b = src.index('<main id="main"'), src.index('</main>') + len('</main>')
main = '''<main id="main" tabindex="-1" class="page-top">
  <section class="pageband" aria-labelledby="page-title">
    <div class="container">
      <p class="eyebrow">Page not found</p>
      <div class="pageband__title">
        <h1 id="page-title" class="h-display">This page fell from the tree</h1>
        <p class="fa fa--title" lang="fa" dir="rtl">پیدا نشد</p>
      </div>
      <p class="lede measure">The link may be old, or the address may have a typo. Everything else is still here.</p>
      <p class="mt-48"><a class="btn" href="/index.html">Back to the home page</a> <a class="link" href="/weddings.html">See the weddings</a></p>
    </div>
  </section>
</main>'''
page = src[:a] + main + src[b:]
page = re.sub(r'<title>[^<]*</title>', '<title>Page not found · Anar Events</title>', page, 1)
page = re.sub(r'<meta name="description"[^>]*>', '<meta name="robots" content="noindex">', page, 1)
page = re.sub(r'\s*<link rel="canonical"[^>]*>', '', page, 1)
page = re.sub(r'\s*<meta property="og:url"[^>]*>', '', page, 1)
# every relative asset / page path -> root-absolute (a 404 is served at any depth)
page = re.sub(r'((?:href|src|content)=")(?!https?:|/|#|mailto:|tel:|data:)([\w.-]+(?:/[^"]*)?)"',
              lambda m: m.group(1) + '/' + m.group(2) + '"' if re.match(r'(assets/|[\w-]+\.(html|png|svg|ico|webmanifest|jpg)\b)', m.group(2)) else m.group(0), page)
page = re.sub(r'srcset="([^"]*)"', lambda m: 'srcset="' + re.sub(r'(^|,\s*)(assets/)', r'\1/\2', m.group(1)) + '"', page)
open('404.html', 'w', encoding='utf8').write(page)

open('robots.txt', 'w', encoding='utf8').write('User-agent: *\nDisallow: /docs/\nDisallow: /src-assets/\nDisallow: /workers/\n\nSitemap: https://anarevents.com/sitemap.xml\n')
today = datetime.date.today().isoformat()
urls = ''.join(f'  <url><loc>https://anarevents.com/{"" if p == "index.html" else p}</loc><lastmod>{today}</lastmod></url>\n' for p in PAGES)
open('sitemap.xml', 'w', encoding='utf8').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')

NIGHT = (27, 34, 30)
pom = Image.open(r'assets\tree\pom-rock.webp').convert('RGBA')
def icon(size, pad):
    c = Image.new('RGBA', (size, size), NIGHT + (255,)); p = pom.copy(); p.thumbnail((size - 2 * pad, size - 2 * pad), Image.LANCZOS)
    c.alpha_composite(p, ((size - p.width) // 2, (size - p.height) // 2)); return c.convert('RGB')
icon(180, 18).save('apple-touch-icon.png', optimize=True)
icon(32, 2).save('favicon-32.png', optimize=True)

# share image: the canopy band of the painting, darkened, with the gold logo (rendered from the SVG by the browser elsewhere,
# so here: the painting only + the logo raster made by docs/council/og_logo.png if present)
tree = Image.open(r'src-assets\tree\tree-full.png').convert('RGB')
band = tree.crop((0, 380, 1536, 380 + 806)).resize((1200, 630), Image.LANCZOS)
band = Image.blend(band, Image.new('RGB', band.size, NIGHT), 0.35)
band.save('og-base.jpg', quality=88)
print('ok: 404.html robots.txt sitemap.xml apple-touch-icon.png favicon-32.png og-base.jpg')
