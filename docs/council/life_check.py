"""Check the trunk/ground life (owner 2026-11-03): stills of the hero logo, the trunk shoots and the rocking ground fruit
at 1440, a phone still of the ground, and a short video (screen 3 then the ground) -> docs/report/anim/."""
import os, glob, shutil, subprocess
from playwright.sync_api import sync_playwright
R = r'C:\dev\anar-site\docs\report\anim'; URL = 'http://127.0.0.1:5173/index.html'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, record_video_dir=R + r'\vid', record_video_size={'width': 1440, 'height': 900})
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(URL, wait_until='load'); pg.wait_for_timeout(2500)
    pg.screenshot(path=R + r'\hero.jpg', type='jpeg', quality=85)
    H = pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0, H, 500): pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(80)
    top = pg.evaluate("Math.round(document.querySelector('.tree__shoot').getBoundingClientRect().top + scrollY)")
    pg.evaluate(f'window.scrollTo(0,{top - 300})'); pg.wait_for_timeout(1500)
    pg.screenshot(path=R + r'\shoots.jpg', type='jpeg', quality=85); pg.wait_for_timeout(3000)
    pg.screenshot(path=R + r'\shoots-2.jpg', type='jpeg', quality=85)
    pg.evaluate(f'window.scrollTo(0,{H})'); pg.wait_for_timeout(1200)
    for i in range(4):
        pg.screenshot(path=R + rf'\ground-{i}.jpg', type='jpeg', quality=85); pg.wait_for_timeout(1300)
    info = pg.evaluate("""() => ({pom: getComputedStyle(document.querySelector('.pom-rock')).transform,
      leaves: [...document.querySelectorAll('.tree__leaf')].map(l => getComputedStyle(l).display + ' ' + (+getComputedStyle(l).opacity).toFixed(2)),
      shoot: getComputedStyle(document.querySelector('.tree__shoot')).transform,
      logo: getComputedStyle(document.querySelector('.hero__logo img')).filter})""")
    print(info)
    vpath = pg.video.path(); ctx.close()
    ph = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True)
    ph.goto(URL, wait_until='load'); ph.wait_for_timeout(2000)
    Hp = ph.evaluate('document.documentElement.scrollHeight')
    for y in range(0, Hp, 500): ph.evaluate(f'window.scrollTo(0,{y})'); ph.wait_for_timeout(60)
    ph.evaluate(f'window.scrollTo(0,{Hp})'); ph.wait_for_timeout(1500); ph.screenshot(path=R + r'\phone-ground.jpg', type='jpeg', quality=85)
    print('phone overflow', ph.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1'))
    b.close()
print('errors', errs[:5])
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vpath, '-ss', '4', '-vf', 'scale=960:-2', '-c:v', 'libx264', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', R + r'\tree-life.mp4'])
print('video', os.path.getsize(R + r'\tree-life.mp4') // 1024, 'KB')
