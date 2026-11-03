# Canopy fix pass 2 — from council round 2 (Argon 9.5/8/9.6, Astra 8.3/7.5/7, Fable 8/8/8)

Sources: docs/council/results/canopy/r2-*.json. Owner decisions stand (keep the sway, the falling and rolling fruit — restrained; do NOT remove them).

## 1. Screen-2 pacing (Argon brand/planner, Astra brand, Fable brand) — the one shared complaint
`.screen--statement .screen__col`: stop centring in a viewport-derived box. Use `align-content:start; padding-top:clamp(40px,6vh,72px)` right under the canopy clearance boundary (row ~1200) and `min-height` reduced (`calc(var(--vh100) - var(--header-h) - 420*var(--s))`), so eyebrow → heading → sentence → promises read as one block directly under the foliage; `.screen--celebrations` desktop top padding 64–96px; `.cel` ↔ `.cel__foot` spacing +var(--s2); figcaption description min-height 48px; a 24px gold rule above each promise h3.

## 2. Hero ownership + robustness (Astra dev blocking, Fable dev)
- canopy.js owns the home hero: site.js block 1 must NOT move/fade the hero mark on the canopy page (skip when `html.canopy-ready`); canopy.js finishes the fade before the mark's translated bounds reach the canopy (measured geometry).
- `.hero__rise` visible by default; hide only via a class canopy.js adds itself (`html.canopy-ready`) inside the gsap context, restore on revert/failure.
- Video start gated on document visibility AND hero visibility (bounds + computed display); keep inside the loader.
- Tree parallax only when `tree && !isPhone()`.
- MutationObserver sync(): don't refresh ScrollTrigger redundantly right after site.js does (debounce/guard).
- Remove permanent `will-change` from canopy layers except `.tree__shake`.
- Add `assets/tree/tree-full-1024.webp` (Pillow) to every srcset + preload; drop the poster preload unless reduced motion.
- No-JS nav: links visible without JS; hide only `html.js:not(.nav-ready) .site-nav` (direction fixed).
- Delete dead CSS/JS from the canopy build: `.descend*`, `.statement*` legacy, accordion, `[data-track]` journey code (verify selectors unused across all four pages first; move to assets/css/legacy.css not loaded by index if any inner page still uses it).
- Footer location line may wrap; header items can shrink at 320px without clipping.

## 3. Brand polish (Fable brand, Argon brand)
- Form on the canopy page: no panel fill (transparent), keep field fills + underlines; remove the gold top border; `.form__status:empty{display:none}`; textarea `resize:none` (or gold-styled resizer).
- Ground fruit sprite: `filter:saturate(.75) brightness(.85) hue-rotate(-8deg)` to match the painted ruby.
- Phones: `--tree-w:110vw; --gutter:40px`; `.tree__band` soft top mask on phones (`mask-image:linear-gradient(to bottom,transparent 0,#000 40px)`).
- Over-hero header: `text-shadow:0 1px 10px rgba(27,34,30,.9)` on `.page-index .site-header:not(.is-scrolled) .site-nav a, .nav-phone` (and hero line already has it).

## 4. Copy (planners)
- index: celebration photos link to the same section as their heading (accessible name + visible focus); foot link "Haldi & pheras, Anand Karaj, walima and the rukhsati: every ceremony, in its own words"; Sofreh figcaption "The Persian ceremony, at the sofreh."; Message textarea: placeholder → persistent helper text "Your families, approximate dates and guest count, the rituals that matter most." + "(optional)" on the label.
- weddings: #nikah first sentence names Afghan traditions (aina mosaf, shirni-khori); #reception-walima: "The rukhsati, vidaai or doli, as your family calls the send-off, cued for the elders; a thank-you card follows."; #anand-karaj: "the couple circle the Guru Granth Sahib four times as the four laavan are sung"; #sofreh-aghd add: "If your family holds a bale-boroon or namzadi before the aghd, it goes in the programme and the elders are seated for it."
- how-we-work: "listed/agreed/named in your proposal" once per section; "Every wedding day run" → "We run the events and hours agreed in your proposal."; consultation priorities include seating, mobility and quiet-space needs (replace the repeated parent-involvement sentence); language-support confirmation sits beside the first parents' page mention; detailed operational bullets under each option go into native `<details>` (start timing + core scope stay visible).

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0..4 and index-phone-0..4: statement block sits right under the foliage, nothing covered, hero readable, no seams; re-take docs/report/canopy-fullpage.jpg (+ phone). Append "Canopy round 2 fixes" to docs/BUILD-NOTES.md. Do not commit.
