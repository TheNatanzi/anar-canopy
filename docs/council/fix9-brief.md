# Fix pass 9 — consolidated from round 9 (Astra 8/8/8, Fable 8/8/8, Argon 9/9/9)

Sources: docs/council/results/r9-*.json (read for exact wording). Owner decisions in docs/council/RUBRIC.md stand. Do NOT move the celebration list off the home page and do NOT replace the strip accordion with a horizontal selector (brand seats prefer the strips).

## 1. Dev — Astra dev blocking, Fable dev, Argon dev
- Form: `.form__more` `<details>` renders OPEN by default in HTML; site.js closes it only after installing the invalid-field expansion handler (so no-JS users see every field). Install that handler before any other form logic.
- Submit success: snapshot the submitted values; reset the form only if its current values still match the snapshot (otherwise leave edits in place).
- `.field input:focus-visible` etc.: visible 2px gold outline with 3px offset (do not remove the outline).
- Leaves: pause the repeating leaf tweens while their section is off-screen (IntersectionObserver), resume when visible; keep the reduced-motion cleanup.
- Reserve space for lazy images on phones (every `<img>` keeps width/height; add `aspect-ratio:attr()` fallback via explicit CSS aspect-ratio on `.slot img`, `.accordion__media img`).
- `ScrollTrigger.refresh()` after `document.fonts.ready` (once) — verify it exists; add if missing.
- Apply whatever r9-fable-dev.json asks that is not contradicted above.

## 2. Brand — Astra brand, Fable brand, Argon brand
- Accordion desktop: expansion ~350ms; text fades in as width becomes available (opacity transition starts at ~40% of the flex transition) instead of hiding for 720ms; keep the title, Persian accent and intro visible, operational text behind the visible Read more on desktop too (summary visible, closed by default on every width).
- `.accordion__body .fa`: `text-align:left; justify-self:start` so the Persian accent sits directly above the h3 (keep `direction:rtl` on the span).
- Phone hero canopy: tune the crop/offset so slivers of both edge trunks stay visible with the middle open (try `width:190vw; bottom:-10%`), check index-phone-0.
- Form panel: background opacity lower (`rgba(18,23,20,.55)`), keep the gold top rule and input fills.
- Hero tag: pair the Persian tag with its English twin: `<p class="hero__tag"><span>Reimagined Heritage</span> <span class="fa" lang="fa" dir="rtl">میراث، از نو</span></p>`; style the English in TT Ramillas 14px uppercase tracking .12em beside the Persian.
- Masthead: remove the inert stone "coming soon" label from the desktop header too (keep the drawer line; add one line "فارسی · coming soon" to `.site-footer__lang`).
- Teaser strips: replace the `<i>` slide-in with the same `<svg class="kashida kashida-draw">` device used under the statement; remove the strip CSS/JS (block 6) cleanly.
- One eyebrow device for all section heads: Persian eyebrow over the English h2 (as celebrations and the teaser do); apply to statement, journey, inquire.
- `.hero__tint::after` gold wash .10; lower tint stop `rgba(27,34,30,.72)`; verify the logo still reads.

## 3. Planner — Astra planner, Fable planner, Argon planner
- Language: everywhere a language promise appears (index #inquire intro, journey Proposal note, footer, panel step 3): "Tell us your preferred language. We confirm written translation and spoken support before booking." (one sentence, consistent).
- Coordination: "finished plan" → "existing bookings and plans"; add on how-we-work #you-get: "The handover lists outstanding tasks and agrees who completes them, with a date."
- Mixed-heritage line beside the celebrations intro (index) and the weddings band: "Two heritages, different levels of observance, or celebrations not listed here? Tell us what your family keeps."
- how-we-work: place the staffing / backup / simultaneous events / delays explanation directly beside the two service options as short labelled statements; add FAQ "What does it cost?" → "Every proposal is priced to the events, days and staffing it covers. Full planning and wedding-day coordination are quoted after the first conversation."
- Mehndi & Sangeet intro (index): "Henna on the bride's hands and the elders' blessing one night; both families singing and dancing the next, as your family keeps it."
- Cut refrains: "you only have to be there" and "one timeline, one person to call" appear once each on the home page (keep them in the founder quote / teaser only).
- After the founder quote: `<p class="center" style="margin-top:24px"><a class="link" href="about.html#letter">Read the whole letter</a></p>` (ensure about.html has id="letter").
- `#f-names` placeholder: "Sara & Omid, or a parent's name".
- Add "Baraat" to the pills (before Pheras) and the Traditions checkboxes.
- Teaser: one line of parental reassurance: "Parents and grandparents are part of every decision you want them in."
- weddings.html: one short line per ceremony on elder seating ("Elders' seats held at the front" or similar, as the family keeps it).

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals, no grid hairlines, no build tools. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-0/1/2/3/4.jpg, index-phone-0/1/2/4.jpg and fix anything visibly broken. Append "Round 9 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.
