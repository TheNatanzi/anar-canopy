"""Build the Argon (Gemini web) audit packet: one text file per role with rubric + code, plus the 6 screenshot paths to upload."""
import os, json
SITE = r'C:\dev\anar-site'; D = os.path.join(SITE, 'docs', 'council')
rubric = open(os.path.join(D, 'RUBRIC.md'), encoding='utf8').read()
files = ['index.html', 'weddings.html', 'how-we-work.html', 'about.html', 'assets/css/site.css', 'assets/js/site.js']
code = ''.join(f'\n\n===== {f} =====\n' + open(os.path.join(SITE, f), encoding='utf8').read() for f in files)
m = json.load(open(os.path.join(D, 'shots', 'manifest.json'), encoding='utf8'))
errs = '\n'.join(m['errors']) or 'none'
for role in ('planner', 'brand', 'dev'):
    txt = (rubric + f"\n\nYour seat: model=argon, role={role}. Browser console errors/overflow found by the harness: {errs}. "
           "The attached images are the home page at desktop and phone, top to bottom.\n\nTHE CODE:" + code)
    open(os.path.join(D, f'argon-{role}.txt'), 'w', encoding='utf8').write(txt)
shots = [os.path.join(D, 'shots', s['file']) for s in m['shots'] if s['page'] == 'index.html']
open(os.path.join(D, 'argon-shots.txt'), 'w').write('\n'.join(shots))
print('packets ready', len(code) // 1024, 'KB code;', len(shots), 'shots')
