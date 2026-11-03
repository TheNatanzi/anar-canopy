# Fix pass 7 — consolidated from round 7 (Astra 8/7.5/7.5, Fable 7/8/?) + Argon round 6 (9/8/8)

Sources: docs/council/results/r7-*.json and r6-argon-*.json (read them for exact wording). Owner decisions in docs/council/RUBRIC.md stand. Compromises below win.

## 1. Real bugs first (site.js, site.css) — Astra dev blocking, Argon dev
- killMotion(): `clearProps:'all'` strips authored inline styles. Clear only the animated props (opacity, transform/x/y/xPercent/rotation, strokeDashoffset, filter) per target.
- Mobile nav fallback: links must stay reachable if site.js never runs. Remove `html.js:not(.nav-ready) .site-nav{display:none}`; keep the pre-JS link strip visible until `.nav-ready`, hide only `.nav-toggle` until then.
- Right trunk strip: inside `.descend__trunk` 100% is the strip's own 20vw box. Use `clip-path:inset(0)` on both strips (they are already 20vw / sized by --edge-space) and masks that fade toward the column edge: left `linear-gradient(to right,#000 calc(100% - 72px),transparent)`, right `linear-gradient(to left,#000 calc(100% - 72px),transparent)`; set each strip's width to `var(--edge-space)` (min 120px) so the fade ends exactly at the content column. Verify 1024/1280/1440.
- Scroll handler: never mutate aria-hidden/tabIndex synchronously during scroll; do it in the settle timeout and skip when the element contains document.activeElement.
- Reveals after anchor jumps: `ScrollTrigger.config({limitCallbacks:true})`; after `scrollToEl()` and on load with a hash, call `ScrollTrigger.refresh()` and force any `.reveal/.stagger` whose trigger start is above the current scroll position to its end state.
- Accordion hover: do not switch panels while focus is inside the open body (including its details/summary).
- Vertical journey/steps dots: align dot centres on the vertical line (move dots 5px right or the line 5px left on phones; keep desktop overrides).
- Canopy: `fetchpriority="high"` on `.hero__canopy`; the preload's `imagesrcset`/`imagesizes` must match the img byte-for-byte.
- Header breakpoint: validate 769/820/900px; if the full nav does not fit at 769–900, move the desktop threshold to 900px in BOTH CSS and `desktopQuery` (and the nav drawer close logic).

## 2. Phone overlap with the Pause button — Argon ×3, Astra
≤768px: `.accordion__body{padding-bottom:64px}`; hide `.motion-toggle` while an open `.accordion__panel` or the form is under it (IntersectionObserver on `.accordion` and `.form`, toggling `.is-hidden`); drop the SCROLL cue on phones (`display:none`).

## 3. Brand (site.css, index.html) — Astra brand, Fable brand, Argon brand
- `.statement__text`: no uppercase, no forced line breaks on desktop either (spans inline), sentence case 34–40px, `max-width:26em`, `text-wrap:balance`.
- Pills → unboxed typographic list: no border/padding; names separated by a gold middle-dot " · ", wrapping, 18–20px, Persian accents kept small in gold.
- Remove repeated gold top borders from `.options > li` and promise rows; keep the single section kashida. Spacing + gold numbers carry the structure.
- Hero: reduce the broad tint a touch (`.hero__tint` .42→.66) but keep the halo; `.hero__canopy` anchored by the bottom (`bottom:-4%; top:auto; width:min(100%,165vh); max-height:68vh; object-fit:cover; object-position:center top`) — the canopy must still rise to ~35–40% of the viewport at the sides, middle open; keep the phone rule.
- Inputs: underline style `border:0; border-bottom:2px solid rgba(201,158,92,.45); background:rgba(27,34,30,.55)`; focus = gold underline; keep checkboxes/selects consistent.
- Desktop accordion: vertical labels `max-height:calc(100% - 64px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; bottom:24px`; strips `filter:blur(3px) brightness(.95)` with a 2px gold rule under each label; `.is-open{flex:4.5 1 0}`; desktop `.accordion__body` padding 32px; one intro sentence visible, the operational text behind the existing details control on desktop too (open by default is fine).
- `.hww-tab`: hide while the hero is in view on desktop too. Header "Inquire" turns ghost while #inquire or the footer is in view (same observer).
- Journey leaf: inside the night section (`top:clamp(24px,4vh,48px); left:-20px`), never crossing the parchment seam.
- Phone header: remove the inert فارسی label from the bar; put one line "فارسی · coming soon" at the end of the drawer. Desktop label keeps its size (no 10px).

## 4. Planner copy (index.html, weddings.html, how-we-work.html) — all three planners
- Pashto everywhere the parents' page languages are listed.
- WhatsApp link in the footer of all three inner pages; "Call or WhatsApp (925) 263-9949" as a plain link in `.hww-panel__foot` and as the last drawer item on phones.
- Language promise lives ONCE in full on how-we-work.html #you-get ("Written translations and spoken language support are confirmed in your proposal."); the home journey Proposal note becomes "The plan, the price, and what is included. A page for the parents, in their language."; panel step 3 and the footer use that short form.
- how-we-work step 05: heading "Your ceremonies are ready. Your family is welcomed."; sofreh checks become an example "when a sofreh is chosen".
- Mehndi & Sangeet (index panel + weddings): henna gatherings and sangeet described separately; music, dancing and baraat "if your family chooses"; "Each night run to the minute" → "Timing agreed around your family's customs." Label: "حنابندان · مهندی".
- Walima line (index #celebration-4 + weddings #reception-walima): "The walima is the groom's family's feast after the nikah, often its own night; the reception is the couple's. We run each as your family keeps it."
- Aina mosaf: "it has its own moment, at the nikah or at the reception under the shawl, as your family keeps it."
- Pills: add "Khina (خینه)"; move "Nowruz / Yalda" out of the pills and the checklist into one line under the list: "A date near Nowruz or Yalda? We plan the table in."
- Traditions checkboxes: add Bale-boroon and Aina Mosaf.
- Pillar 01 muted: "Names, dates and rituals, exactly as your family keeps them." Pillar 02 muted: add "Parents and elders are involved at the level the couple chooses." and repeat it in the panel Consultation step.
- Inquiry failure messages (site.js): include clickable mailto and WhatsApp links; keep entered values.

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals, no grid hairlines, no build tools. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-0/1/2/3/4.jpg, index-phone-0/1/3/4.jpg and fix anything visibly broken (overlaps, cut-offs, hard trunk edges, hero canopy covering the logo or descriptor). Append "Round 7 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.

## 5. Fable dev round 7 (r7-fable-dev.json)
- Drop the upscaled `pom-tree-night-1400.jpg` candidate (master is 1125w); keep 800w + master.
- Remove `ScrollTrigger.refresh()` from accordion settle(); the ResizeObserver already refreshes.
- Merge the two window scroll listeners into one rAF-gated listener; write classList/aria/tabIndex only when the value changes.
- Fixed header: limit `backdrop-filter:blur(8px)` to `(min-width:769px) and (hover:hover)`; keep the .96 fill.
- `.inquire__contact`: remove the permanent 52px indent (the form's 56px bottom padding covers the overlap).
