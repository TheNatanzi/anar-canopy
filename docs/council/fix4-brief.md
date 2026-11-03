# Fix pass 4 — consolidated from round 4 (Astra 7/7.5/7, Fable 7/8/7)

Source JSONs: docs/council/results/r4-*.json (read them for exact wording). Where two seats disagree, the compromise below wins.

## 1. Journey track (site.js block 5 + block 4 kashida) — Fable dev BLOCKING, Astra dev
`.track-line`/kashida paths use `vector-effect:non-scaling-stroke`, so dasharray from getTotalLength() (user units) is wrong in screen px. Measure rendered length: `var r=p.getBoundingClientRect(); var len=Math.max(r.width,r.height)`; pass dash values as functions and refresh on resize/ScrollTrigger.refresh. Dot activation from layout: horizontal `at=(d.getBoundingClientRect().left+7-track.getBoundingClientRect().left)/track.offsetWidth`, vertical `at=(d.offsetTop+7)/track.offsetHeight`; recompute on refresh.

## 2. Motion toggle (site.js syncToggle, site.css) — Astra dev ×2 rounds
Keep the control visible on phones the whole page (remove the hero-based auto-hide for `.motion-toggle`; keep it 36px, bottom-left). aria-label="Pause motion", aria-pressed="true" = paused; visible text unchanged. Rebuild leaf tweens on the 769px breakpoint change (kill old first).

## 3. Accordion (site.css desktop .accordion*) — Astra dev blocking
Expanded panels must grow to fit their text (no fixed height + overflow:hidden clipping). Let the open panel's body set min-height; fall back to the stacked layout under 1100px or when text is tall. Verify the longest panel (Sofreh Aghd) at 1024 and 1440.

## 4. Teaser strips (site.css `.anim-ready .teaser__strips i`, site.js) — Astra dev
Drop the CSS translateX(102%) initialisation; GSAP alone sets xPercent 102→0 with x:0.

## 5. Phone clearance (site.css ≤768) — Fable dev + Astra brand agree
Remove the global `.container{padding-right:max(var(--gutter),44px)}`. Keep 44px only on `.accordion__body`, `.journey__stop`, and give `.quote blockquote` symmetric padding (same left and right, 32px) so it stays centred. Hide `.hww-tab` on phones while the hero is in view (reuse the hero IntersectionObserver → `.is-hidden`), slide in after.

## 6. Hero (site.css) — Astra brand, Fable brand
`.hero__line`: sentence case ("Wedding planning and coordination for Persian, Afghan and South Asian families" on line 1, "San Francisco Bay Area" on its own short line via a <br> or span), letter-spacing .04em, 14px on phones. Phone canopy: `width:175vw; bottom:-8%`.

## 7. Pillars + spacing (site.css) — Astra brand, Fable brand
`.pillars .card`: remove the three top borders; gold numbering eyebrow carries the structure; horizontal padding 16px. `.descend__content` padding-bottom `clamp(40px,6vh,80px)`; `.descend::after` height 140px, so the gap to "The celebrations" is about one card height. Section rhythm: 64–80px between sections, 24–32px heading-to-content.

## 8. Pills (site.css .pill) — compromise
Softer: `border:2px solid rgba(201,158,92,.45); padding:6px 16px;` Persian in gold at .7; full gold on hover/focus. After the pills add `<p class="center reveal" style="margin-top:40px"><a class="btn" href="#inquire">Begin the conversation</a></p>`.

## 9. Checkboxes (site.css .check input) — Fable brand
appearance:none; 18px; border 2px var(--stone); radius 2px; transparent; :checked → background var(--gold), border gold, with a cypress check mark (inline SVG data URI); :focus-visible outline gold.

## 10. Leaf (site.css .journey .leaf--3) — Fable brand
`left:0; top:-4vh; opacity:.7;` ≥900px `transform:translateY(-20%)` so it never crosses the gold line or the Enquiry column.

## 11. Homepage options (index.html .teaser/.options) — Astra brand ×2
Homepage keeps a SHORT two-option comparison (3 short bullets each + "All five steps and what you get" link); the full responsibility lists live only on how-we-work.html #you-get. If the teaser also has separate "Plan" / "Run the day" cards that overlap with the options, remove those cards.

## 12. Planner items (index.html, weddings.html, how-we-work.html) — both planners
- weddings.html: give **Anand Karaj** its own section + photo slot (split from Haldi & Pheras). Pheras copy: replace the blanket "seven circuits…" description with "We confirm the ceremony sequence with your family and officiant." Keep the fixed caption wording.
- Afghan recognition: add a short passage (weddings.html, Nikah section or a new "Afghan weddings" note) on how the family names its ceremonies, languages and participants; add a **Shirni-khori** (شیرینی‌خوری) pill + form checkbox, and an **Aina Mosaf** (آینه‌مصحف) line inside the Nikah panel (index #celebrations) and the weddings Nikah section.
- Reception/walima + shared .hww-steps + how-we-work: dancing, blessings and order are conditional on the family's wishes; replace any prescribed wedding-day list with "The ceremonies your family chooses, in the order agreed with your family."
- Mehndi & Sangeet body (#celebration-3): "On the wedding day, the baraat arrives with music. Each night run to the minute."
- Same five stages everywhere (index #journey, shared .hww-steps panel, how-we-work #steps): Enquiry · Consultation · Proposal · Planning · The wedding days. In Proposal say the agreed scope names the covered events, staffing, hours and fees.
- Journey Enquiry note: "Write to us, or call. Tell us about your family and your dates." Keep "We reply within one business day" only in the inquire sub-line and the form note.
- Form: add a line "Only names and email are required." above the first row; label budget "Estimated total wedding budget across all events" + option "Not sure yet"; guest count label "Largest day's guest count"; add optional "Number of events" number field. Reply-in: English, Persian, Dari, Urdu, Hindi, Punjabi, Other — and change every "Persian and Dari pages for the parents" line to "Persian and Dari pages for the parents; Urdu, Hindi or Punjabi on request" (index, how-we-work, FAQ).

## 13. Self-host vendors + Arabic font (all four <head>s, site.css) — Fable dev
Download gsap 3.12.5 (gsap.min.js, ScrollTrigger.min.js) and lenis 1.1.18 (lenis.min.js) with curl into assets/js/vendor/ and reference them locally (keep the same load order); remove the cdnjs/unpkg preconnects. Fetch Noto Naskh Arabic 400 + 700 woff2 (Arabic subset) from Google Fonts' CSS (curl with a Chrome UA to get woff2 URLs) into assets/fonts/, declare @font-face with font-display:swap and unicode-range for Arabic, preload the 400 file; remove the Google Fonts <link>. If any download fails, keep the CDN path and say so.

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals words, no grid hairlines, no build tools. Owner decisions in docs/council/RUBRIC.md stand. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-0/1/3/4.jpg, index-phone-0/1/3.jpg, weddings-desktop-2.jpg and fix anything visibly broken. Append "Round 4 fixes" to docs/BUILD-NOTES.md. Do not commit, do not create backup files.
