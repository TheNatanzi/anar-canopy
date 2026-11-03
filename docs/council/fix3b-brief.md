# Fix pass 3b — consolidated from round 3 (Astra 6/7/7, Fable 7/7/7)

Already done by me (do not redo): Hindu/Sikh caption fixed; consultation line reworded; `.descend__trunks` has a bottom mask; leaf loop desktop-only; header .96 alpha; phone hero controls.

## A. Journey (index.html #journey + site.css .journey*, site.js block 5)  — BOTH planners + both brand seats
Restructure: the line carries the FIVE planning stages only: Enquiry · Consultation · Proposal · Planning · The wedding days (Persian: درخواست · مشاوره · پیشنهاد · برنامه‌ریزی · روزهای عروسی). Eyebrow: "Five steps on one line". Notes ≥16px desktop, columns wide (container max 1320px at ≥900px).
Beneath the line, a separate loose group (no connecting line, no numbering), eyebrow "Celebrations your family may choose", as gold-outlined pills with English + small Persian: Bale-boroon (بله‌برون) · Mehndi / Henna (حنابندان) · Sangeet · Haldi · Aghd (عقد) · Nikah (نکاح) · Pheras · Anand Karaj · Reception / Walima (جشن عروسی) · Nowruz / Yalda. Keep the gold track-line draw animation on the five stops (site.js block 5 must still find .track-line/.track-dot; update any "nine" counts or copy). Mobile: vertical line with five stops; pills wrap.

## B. Full planning scope (index.html .options + how-we-work.html #you-get .options)
Full planning bullets must be concrete: budget held and tracked; venue and vendor shortlist, booking support and contract review; planning decisions scheduled ritual by ritual; one written plan with Persian and Dari pages; every wedding day run. Coordination: starts 6–8 weeks out, takes over the family's finished plan, confirms every contract/contact/time, runs the days. Keep "What you get" list consistent. No catering/decor/rentals words.

## C. Form (index.html #inquire)
Remove the "Which days" select (#f-days) and its wrapper; move #f-help next to #f-phone or give it a full row. Add checkboxes to the Traditions group: Engagement, Other, Not sure yet (first/last). Reply-in: keep English, Persian, Dari and add "Other (say which in the message)"; drop Urdu/Hindi/Punjabi (owner can re-add). FAQ language answer in how-we-work.html: say the planning pages come in Persian and Dari, other languages on request.

## D. Phone tab clearance (site.css ≤768px)
.hww-tab is ~34px wide mid-height. Add right padding so text never sits under it: `.accordion__body{padding-right:56px}`, `.quote blockquote{padding-right:40px}`, and `.container{padding-right:max(var(--gutter),44px)}` on ≤768px (check nothing else breaks). Also fix the left-trunk sliver at the top of #celebrations on phones: on ≤768 set `.descend{--edge-space:34vw}` only if the trunk is meant to show, otherwise hide the trunks on ≤768 (`.descend__trunks{display:none}`) — choose hide, simpler and the brand seats prefer a clean phone.

## E. Brand polish (site.css)
- Pillars: keep the three "We are always…" cards but lighten: remove the dark box fill (transparent, keep gold top rule), horizontal padding 16–24px, h3 24–26px.
- Founder quote: "Keep the soul. Redefine the style." is the only display-size line (36px desktop, ruby); the other sentences 24–28px parchment in two paragraphs. Keep the owner's words verbatim.
- Phone hero: `.hero__line{text-shadow:0 1px 12px rgba(27,34,30,.9)}` and slightly larger halo on ≤768.
- Motion toggle: replace Georgia glyphs with inline-SVG background (two gold bars / gold triangle) — keep aria-label "Motion" + aria-pressed.
- Journey: `padding-top:clamp(40px,7vh,88px)`; `.journey__order` plain `margin:0 auto clamp(32px,6vh,72px)`.

## F. Dev polish
- scrollToEl(): add `outline:none` for programmatically focused sections (`[tabindex="-1"]:focus{outline:none}`), keep skip-link focus visible.
- `<head>` all four pages: add `<link rel="preconnect">` for cdnjs.cloudflare.com and unpkg.com; preload hero-poster-small.jpg on index; only the logo keeps fetchpriority=high.
- Mobile nav: close on breakpoint change to ≥769 and when a nav link is activated.
- Leaves: scroll-scrub tween on a wrapper, loop on the child (or skip the scrub when the loop runs) so the same `y` isn't driven twice.
- Video: pause on document visibilitychange hidden, resume if visible and motion enabled.
- Proof slot: between #celebrations and the quote add a clearly marked, hidden-by-default block `<section data-owner-input="proof" hidden>` with a testimonial figure and a proof line, styled like the real thing; add a note in docs/BUILD-NOTES.md "Round 3 fixes".
- weddings.html lede: "stripping away the stress and the outdated tropes" → "stripping away the stress, never the meaning".
- Reduce repeats of "We ask how your family observes each tradition" to one on index (keep on how-we-work once).

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals, no grid hairlines, no new dependencies. Run `node --check assets/js/site.js`. Then `PYTHONIOENCODING=utf-8 python docs/council/shots.py` and look at docs/council/shots/index-desktop-3.jpg (journey), index-phone-1.jpg (celebrations), index-desktop-4.jpg (form) to confirm. Append "Round 3 fixes" to docs/BUILD-NOTES.md. Do not commit.
