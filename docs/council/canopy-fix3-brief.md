# Canopy fix pass 3 — from council round 3 (Argon 9.6/9.5/9.6, Astra 8/7.5/7.5, Fable 8/8/8)

Sources: docs/council/results/canopy/r3-*.json. Owner decisions stand (keep sway, shake, falling + rolling fruit; the "How we work +" tab is back by owner choice; one-tree concept; ≤120 home words).

## 1. Art continuity (Astra brand blocking, Fable brand)
- Left trunk shows an abrupt horizontal step near the statement opening (desktop shot 1): align the overlapping bark contours of the canopy layer / band / sprig layers so every mask transition falls inside opaque bark; junctions stay still — only the canopy foliage sways. Canopy fade-out: `#000 at 1140·s → transparent at 1200·s` (above the shrub leaves); sway ±0.25°.
- Phones: `.tree__band` top mask `calc(80*var(--s))`; 25% cypress tint over the band; drop the pasted `.screen--inquire .leaf--3` (or opacity .45).

## 2. Dev (Astra dev blocking, Fable dev, Argon dev)
- No-JS/failed-JS nav: links collapse only under `.nav-ready`; usable fallback until handlers attach (the inline `.js` class must not hide them).
- `.nav-home` phone overrides after the base rule so they apply; phone `.hero__mark` positioned from the rendered logo+descriptor+tag height (not a blind top:30%); verify 390×844 and 360×740.
- `<details>` toggles → schedule ScrollTrigger.refresh + Lenis resize; one reusable shake timeline restarted per flick; `will-change` only under `html.canopy-motion .tree__shake`; tree-full preload `media="(prefers-reduced-motion: no-preference)"`; hash landing uses immediate scroll (no glide); `resize:vertical` on the textarea with min-height.
- `role="list"` on every list whose bullets are stripped (promises, nav, options, you-get…); celebration figure: one link per destination (image click = same link via the figure, not a second tab stop).
- Move unreferenced art out of assets/tree (tree-full.png, canopy-u3*.png, trunks-tall, trunk-left/right png, roots-floor.png, leaves-float) to src-assets/tree; ship only what pages load.
- Tablet 769–1000px: `.cel` three columns in a 68vw column is too narrow — two columns + one, or 90vw column; statement column width checked at 800px.
- Phones: the gap between the promises and "The celebrations" (~165px) → cap padding so it is ≤ 80px.
- Cold load: the logo should paint before the deferred bundles land — no `opacity:0` on `.hero__rise` until `html.canopy-ready` exists (already) AND add the logo `<img>` to the preload list with fetchpriority high.
- Header inquire ghost: observe the submit button itself, not the whole #inquire section.

## 3. Brand (Argon brand, Fable brand)
- `.inquire__call a` underline `var(--gold)`; `.site-header.is-scrolled, .site-header--solid` get a 2px gold rule at .35 opacity; submit row centred; phone `.hero__tint` bottom cypress ramp (`.42 → .72 at 60% → var(--night)`); one static `.leaf--3` crop (right edge, hidden on phones) on each inner-page band; hero tint: lighter overall wash, contrast kept behind the logo + descriptor.

## 4. Copy (planners) — exact wording in the JSONs
- how-we-work: ONE language qualification everywhere: "Parents' pages in the language agreed in your proposal; translation and spoken support confirmed before booking."; signage/thank-you cards/translated materials "as named in your proposal"; Consultation + Proposal paragraphs → short labelled points (guest needs · parent involvement · decision approvals · date reservation); "Begins 6–8 weeks before the first event · we run the days you have planned"; FAQ "Where do you work?" names South Bay / Silicon Valley and Wine Country (Napa/Sonoma).
- weddings: delete the stray "The Persian ceremony." fragment and merge that paragraph; Nikah paragraph 1 trimmed + "For Afghan families who observe shirni-khori or aina mosaf…" (optional wording); Sofreh: one line on the kaleh ghand (sugar cones); pre-wedding: "In the nights before, if your family holds them: the mayun, dholki or jaggo…".
- index: screen-2 eyebrow → "جشن‌هایی که از آنِ شماست" (not the hero tag again); `#f-names` placeholder "Sara & Omid, or Mr & Mrs Rahimi"; `.cel__foot` line "Haldi & pheras, Anand Karaj, walima, rukhsati: every ceremony on the Weddings page" (wraps cleanly at 390).

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0..4, index-phone-0..4 and one shot per inner page: no trunk step, nothing covered (tab included), hero readable on phones. Append "Canopy round 3 fixes" to docs/BUILD-NOTES.md. Do not commit.
