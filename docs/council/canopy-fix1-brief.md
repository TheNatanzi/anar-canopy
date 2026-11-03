# Canopy fix pass 1 — from council round 1 (Argon 6/8/7, Astra 7.8/6/6, Fable 6/8/7)

Sources: docs/council/results/canopy/r1-*.json (read them for exact wording). Owner decisions in docs/council/RUBRIC.md stand: keep the one-tree four-screen concept, ≤120 home words, no tab, NOTHING covered. Ignore any ask for more copy/sections or for removing the sway / fruit motion (owner asked for it; keep it restrained).

## 1. Hard-rule fixes (all seats)
- Pause/motion button must never cover anything: on ALL widths dock it in the header bar (right side, beside Inquire; on phones beside the menu toggle) as a small 36px round control — no longer fixed bottom-left. Remove the bottom-left rules, the scroll-hide logic and any footer/input clearance hacks that existed for it.
- Remove the "How we work +" tab, backdrop and panel from weddings.html, how-we-work.html and about.html too (site.js already guards). Move the header-Inquire ghosting observer OUT of the `if (tab && panel && backdrop)` block so it runs everywhere.
- Add the inner-page "How we work" content nowhere else — it already has its own page.

## 2. Screen 2 composition (Astra brand/dev, Fable brand/dev/planner, Argon brand)
- The statement ("Reimagined Heritage" + sentence + 3 promises) must start right at the canopy's underside (art row ~1200) so screen 2 reads "canopy overhead, words beneath" — never a full viewport of foliage with no words. Retune `--tree-top` / `--at-1270` together; the heading must clear the fixed header and the lowest hanging fruit; centre the block in the open gap (`min-height:calc(var(--vh100) - var(--header-h)); display:grid; align-content:center`).
- One effective hero height (include the 600px minimum) used consistently for hero layout, tree placement and statement offsets; check 1440×700 and 390×844.
- Restore a restrained soft cypress radial halo behind the gold logo (no panel edge).

## 3. Code fixes (Astra dev, Argon dev, Fable dev)
- `.tree__sprig img{width:var(--tree-w)}` (not 100%) so sprig crops register with the tree.
- Velocity-shake timeline: create inside the gsap context / track it and revert in kill(); reset state.
- Keep content geometry stable when motion toggles (compensate tree positioning instead of switching the statement's flow offset); refresh triggers after.
- build(): create the context first, wrap construction in try/catch, revert partial work on failure.
- Phones: `.tree img.fruit-drop{display:none}`; skip buildLeaves() for leaves that are display:none; `--gutter:36px` on the canopy page so copy clears the bark slivers.
- `.tree{will-change}` removed (keep on canopy / shake / sprigs); fonts `font-display:swap` with the size-adjusted fallback; drop the upscaled `pom-tree-night-1400.jpg` srcset candidates on inner pages.
- Add `assets/tree/tree-full-768.webp` (Pillow, half width) + srcset/sizes on every tree-full use.
- Hero rise: `.js.anim-ready .canopy .hero__rise{opacity:0}` (+ reduced → 1) and tween `to` opacity 1.
- Form: `minmax(0,1fr)` columns, inputs `min-width:0`; `#f-names` placeholder "Sara & Omid" with helper text "Couple or parent names" under the label (aria-describedby); add optional Phone / WhatsApp `<input type="tel">` beside Email.
- Site-wide US spelling: "The elders honored, your vision realized."
- Footer: "Anar Events · San Francisco Bay Area" on one line (nowrap); `.site-footer__logo{width:min(100%,240px)}`; `.screen .eyebrow .fa{font-size:20px;line-height:1.5}`; kashida alignment consistent with the headings under it.
- Home celebrations: each title links to its weddings.html section; foot link text "Haldi & pheras, Anand Karaj, walima: every tradition, in its own words".
- Inner pages (planner): how-we-work — move the two service options above the five steps; "once planning begins" wording. weddings — henna and sangeet as two short paragraphs, baraat moved to the wedding-day ceremony; jump links to each ceremony section after the band; English eyebrows "Hindu ceremonies" / "Sikh ceremony" on those sections; "Elders' seats held at the front" once in the intro; "as your family keeps it" at most once per section.

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0..4 and index-phone-0..4 and confirm: nothing covered anywhere (header control, footer, inputs), screen 2 has words under the canopy, no seams. Re-take docs/report/canopy-fullpage.jpg (+ phone). Append "Canopy round 1 fixes" to docs/BUILD-NOTES.md. Do not commit.
