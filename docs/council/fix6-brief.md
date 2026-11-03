# Fix pass 6 — consolidated from round 6 (Astra 7.5/7/7.5, Fable 8/8/8)

Source: docs/council/results/r6-*.json (read for exact wording). Owner decisions in docs/council/RUBRIC.md stand (the trial font is now listed there — leave it).

## 1. Journey (site.css .journey__stop, index.html) — 4 seats
- `.journey__stop{align-content:start}` with consistent grid rows (title / Persian / note) so Persian labels sit directly under each title.
- Shorten each homepage journey note to ONE sentence; fuller text lives on how-we-work.html (link already there).
- Leaf: desktop `.journey .leaf--3` smaller (scale .55) and tight to the left edge; phone `left:-40px;top:-24px;opacity:.35` so it never sits behind the eyebrow.

## 2. Homepage order (index.html) — Astra brand + planner (two rounds)
Move the two-option service comparison (`.options` + its foot link) directly after the three promises (before #celebrations). Keep #journey after celebrations.

## 3. Language + scope consistency (how-we-work.html #you-get, index, footer, hww panel) — Astra planner blocking
- ONE promise everywhere: "Translated summaries and spoken language support are agreed before booking and listed in your proposal." Apply to Pashto too (name Pashto where the other languages are named). Replace any blanket "both scripts / both digit sets" promise with that line.
- "With either option": "across every day" → "across the events and hours listed in your proposal"; qualify staffing, signage coordination and post-wedding support the same way.
- #celebrations intro + weddings tradition intro: add "These are examples; we confirm your family's customs and sequence with you and your officiant."

## 4. Celebrations copy (index.html panels) — Fable planner
- Panel 3 Mehndi & Sangeet: "The henna night: hana-bandan for Persian families, khina for Afghan families, mehndi for South Asian families. The sangeet, when both families sing." (keeps the Persian label earned).
- Panel 4 Haldi & Pheras: "We coordinate timing with the mandap" → "with the pandit and the venue".
- Add 'Rukhsati / Vidaai' and 'Patakhti (پاتختی)' to the pills AND the Traditions checkboxes.
- "Parents and elders included at the level you choose" appears once (journey). Pillar 02 muted line → "Elders greeted first, and asked, not told."; form note → "We reply within one business day. Parents are welcome to write too."; #inquire intro → "Write to us in English or your own language; we reply within one business day." Add "Couples and parents are both welcome to inquire." near the intro.

## 5. Form (index.html) — Fable planner, Astra planner
- Phone moves into the first row beside Email (names / email / phone), optional; note stays "Only names and email are required."
- #f-role and #f-lang get a blank default option "Choose if helpful".
- Inputs: `border:2px solid rgba(185,179,166,.6)`, 2px gold on focus (site.css .field input/textarea/select).
- Phones: remove the 52px left padding on the closing note; give `.form` 56px bottom padding instead.

## 6. Pillars (index.html, site.css) — Fable brand
Eyebrows become numbers only (`01`, `02`, `03`); each h3 carries the full owner promise: "We are always fluent in the unspoken details" / "We always honor the elders' legacy while bringing your modern vision to life" / "We always run multi-day cultural productions, seamlessly". Keep h3 size balanced (≤4 lines at 1440).

## 7. Accordion (site.css, site.js) — Astra dev blocking, Fable brand
- No-JS fallback: under `html:not(.site-ready)` every `.accordion__body{position:relative;inset:auto;pointer-events:auto;opacity:1}` and panels grow with their expanded details.
- Keyboard focus ring on the panel: `.accordion__panel:has(.accordion__trigger:focus-visible){outline:2px solid var(--gold);outline-offset:-2px}` drawn above media/body layers.
- Reserve desktop row min-height for the tallest expanded description at the current width (measure all `.accordion__body` scrollHeights after fonts load / resize; set a CSS var).
- Collapsed strips lighter: media brightness .9; collapsed overlay `linear-gradient(to top,rgba(18,23,20,.8),rgba(18,23,20,.35))`.

## 8. Nav + misc dev (all pages, site.css, site.js) — Fable dev, Astra dev
- Pre-JS nav: scope the link strip to `html:not(.js) .site-nav`; add `html.js:not(.nav-ready) .site-nav{display:none}` on phones; keep `html:not(.js) .nav-toggle{visibility:hidden}`. Use the SAME desktop threshold in CSS (769px) and `desktopQuery`; close the drawer on crossing it.
- `onMQ(mq,fn)` helper (addEventListener → addListener fallback) for all matchMedia change bindings.
- Canopy: export `assets/tree/canopy-u3-2048.webp` (Pillow, from canopy-u3.png) and add `2048w` to both srcset lists.
- Re-encode pom-pile-1400.jpg at q72 with 4:2:0 subsampling (target ≤180 KB); same for pom-pile-800.jpg.
- Housekeeping: fix the block-6 comment (one `<i>`), unwrap the always-true `@media (min-width:0)` block, add `<link rel="canonical" href="https://anarevents.com/<page>">` per page and a 180px `apple-touch-icon.png` (render from the gold logo SVG with Pillow+cairosvg if available, else skip and say so).
- Phones ≤480: keep a visible "coming soon" beside فارسی: show `.nav-fa__soon` as a tiny 10px line under it instead of hiding it (make sure it does not wrap the header).
- `.statement` on phones: remove forced `<br>` line breaks (wrap in spans with `display:inline` on ≤768), letter-spacing .02em, `text-wrap:balance`.

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals words, no grid hairlines, no build tools. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-1/2/3/4.jpg, index-phone-0/1/3/4.jpg, how-we-work-desktop-2.jpg and fix anything visibly broken. Append "Round 6 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.
