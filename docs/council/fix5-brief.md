# Fix pass 5 — consolidated from round 5 (Astra 7.4/7.5/7.5, Fable 7/8/8)

Source: docs/council/results/r5-*.json (read for exact wording). Compromises below win where seats disagree.

## 1. Tree art seams (site.css) — Astra brand blocking, Fable brand
- `.ground__roots`: add top fade `-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 22%);mask-image:…` so the roots emerge from night with no horizontal cut.
- `.descend__trunk--l/--r`: tie the horizontal mask fade to the clip edge: left `linear-gradient(to right,#000 calc(var(--edge-space) - 72px),transparent var(--edge-space))`, mirrored right; drop the fixed 70% stop.

## 2. About page placeholder (about.html #letter) — Fable planner BLOCKING
The bracketed founder-bio placeholders ('[Medi: two lines…]', '[one proof line…]') render publicly. Put them in a `.letter__bio` block with `hidden` + `data-owner-input="bio"` (same pattern as the proof slot) and keep an HTML comment telling the owner what to paste.

## 3. Language consistency (index.html, how-we-work.html) — both planners
- Rename "Reply in" → "Preferred language"; options English, Persian, Dari, Pashto, Urdu, Hindi, Punjabi, Other.
- One consistent promise everywhere (journey Proposal note, hww-panel step 3, how-we-work step/FAQ, footer line): "A page for the parents, in Persian, Dari, Urdu, Hindi or Punjabi. We confirm language support before booking." Distinguish translated pages from spoken support in the FAQ: "Planning pages are translated; spoken support in your language is confirmed before booking."
- Keep "به‌زودی" (coming soon) visible beside the inactive فارسی at ≥481px (it is).

## 4. Ceremony copy — follow the family (weddings.html, index.html) — both planners
- weddings #nikah, #haldi-pheras, #anand-karaj: introduce optional practices with "If your family observes…"; describe aina mosaf separately from the nikah contract; replace "Seven circuits under the mandap…" in body copy with "Your ceremony, in the sequence agreed with your officiant." (caption may keep its wording).
- index #celebrations: give **Anand Karaj its own panel** (6 panels), matching weddings.html. Drop the Persian caption on the Hindu and Sikh panels (keep on Sofreh Aghd, Nikah, Mehndi/Henna, Reception/Walima).
- Pillar 03: "From the engagement to the walima" → "From the engagement to the last reception".
- weddings #seasons: put "Two heritages at one table?" on its own eyebrow/heading.
- Use "Inquiry" (not "Enquiry") everywhere: journey stop, hww-steps, how-we-work step 01.
- how-we-work consultation/proposal: add "Together, we agree who approves decisions, who approves spending, and which updates each family receives." and one line on how the couple sets the level of parent involvement.
- Service comparison (index .options + how-we-work #you-get): coordination "covers the events, hours and staffing named in the proposal"; "your budget held" → "your budget tracked"; contract review "covers planning requirements and vendor logistics".

## 5. Inquiry form (index.html #inquire) — Astra planner, Fable planner
- Move `.inquire__contact` (email / phone / WhatsApp) ABOVE the form.
- Order: names, email, message first; then a `<details class="form__more">` "Share more wedding details" holding phone, date, venue, guests, events, help, language, traditions, budget (keep every field and name; details open by default? No — closed, but keep fields submittable).
- ≤768px: last `.form__note` and `.inquire__contact` get `padding-left:52px` so the fixed Pause button never covers them.

## 6. Phone tab + toggle clearance (site.css, site.js) — Astra dev blocking, Fable dev
- Reserve ~44px right clearance on phones for text sections that can sit under `.hww-tab`: `.statement`, `.options li`, `.tradition__text`, `.faq`, `.step` (inner pages) — right padding only on left-aligned text; centred blocks keep symmetric padding.
- Phone `.motion-toggle`: same hide-while-scrolling-down behaviour as `.hww-tab` (toggle `.is-hidden` from the same scroll handler; show when still, keep aria/tabindex sync).

## 7. Accordion (site.js, site.css) — Astra dev blocking, Fable dev
- After open() settles (transitionend / the .7s timer) and after the 1100px breakpoint change: `ScrollTrigger.refresh()`; add a ResizeObserver on `.accordion` that refreshes on height change (debounced).
- Keep row height during expansion; reveal the opening body only once the container can hold it (opacity after the flex transition).
- `.accordion__panel.is-open .accordion__body{pointer-events:auto}`.
- Phones: compact preview — each panel shows image + title + Persian; the description is inside a native `<details>`/button "Read more" (owner-friendly, no JS dependency). Keep the first panel expanded by default.

## 8. Brand polish (site.css, index.html) — Astra brand, Fable brand
- `.pillars .card h3{font-size:clamp(22px,2vw,24px);text-wrap:balance}`; card side padding 12–16px, column gap 24px, so pillar 02 wraps to ≤4 lines at 1440.
- Quote supporting paragraphs 22–24px desktop; ruby key line stays 36px.
- `.pill`: no hover treatment (labels are not interactive); Persian label `var(--gold)` at full opacity; keep the soft outline.
- Teaser strips: ONE 2px gold kashida line sliding in (remove the two offset lines) — site.js block 6 must still work with one `<i>`.
- Hero tint: add a warm layer: `.hero__tint{background:linear-gradient(rgba(27,34,30,.5),rgba(27,34,30,.72))}` plus `.hero__tint::after` with `rgba(201,158,92,.06)` mix (keep the logo readable; do not touch the mp4).

## 9. Dev polish — Astra dev, Fable dev
- `srcset`/`sizes` for every photo slot: generate 800w and 1400w JPEG variants of assets/img/pom-*.jpg with Python Pillow (quality 82) into assets/img/, e.g. pom-pile-800.jpg; `sizes="(max-width:1099px) 100vw, 60vw"`. Canopy: generate canopy-u3-1376.webp (half size) and use `srcset="…-1376.webp 1376w, canopy-u3.webp 2752w" sizes="(max-width:768px) 175vw, max(100vw,140vh)"`.
- Fonts: `font-display:block` for the two preloaded self-hosted fonts.
- loadHeroVideo(): only load()/play() when `heroVideo.getBoundingClientRect().bottom > 0`, else let the IntersectionObserver start it; add `disablepictureinpicture disableremoteplayback` to the `<video>`.
- Reduced motion (OS): hide the play control with a visually-hidden explanation "Motion is off because your device asks for reduced motion"; preserve the stored user pause preference.
- TT Ramillas: leave the trial file but add a comment in site.css `@font-face` "replace with licensed TT Ramillas Bold before launch" and keep the BUILD-NOTES item.

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals words, no grid hairlines, no build tools, owner decisions in docs/council/RUBRIC.md stand. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-0/1/2/4.jpg, index-phone-1/4.jpg, about-desktop-1.jpg, weddings-desktop-3.jpg and fix anything visibly broken. Append "Round 5 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.
