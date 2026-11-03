# Fix pass 8 — consolidated from round 8 (Astra 7.5/7.5/7.5, Fable 7/8/8, Argon 9/8/9)

Sources: docs/council/results/r8-*.json (read for exact wording). Owner decisions in docs/council/RUBRIC.md stand. Where seats contradict each other, the compromise below wins; do NOT remove the journey or the celebration list (owner-approved structure).

## 1. Dev (site.js, site.css) — Astra dev, Fable dev, Argon dev
- Mobile drawer: cap at `calc(100dvh - var(--header-h))`, `overflow-y:auto`, `data-lenis-prevent`; close on click outside the header and on focusout leaving the header; sync aria-expanded on resize; set `main` inert while open.
- Reveals: keep `limitCallbacks:true` but make `settleReveals()` also run on ordinary scroll end (the rAF scroll listener's settle) so any `.reveal/.stagger` whose trigger range has been passed is completed.
- setShown()/syncTab(): keyboard availability follows the visual state immediately when showing; never hide a focused control.
- killMotion(): put this site's tweens/ScrollTriggers in a `gsap.context()` and `revert()` that context instead of killing every ScrollTrigger / globalTimeline.
- Hero video: `.catch()` on play(), `error` listener on the video and the appended source → fall back to the poster silently.
- Accordion: collapsed bodies get `aria-hidden="true"` + `inert` at every breakpoint (open body removes both); ResizeObserver refresh tied to rAF + 150ms debounce; wrap the `matches()` call in try/catch.
- `.form__status:empty{display:none}` instead of the height-0 trick; remove `will-change` from `.card`.
- Inputs: unfocused underline opaque enough for contrast: `border-bottom:2px solid rgba(201,158,92,.7)`.
- Move unreferenced PNG sources (`assets/tree/*.png`, `assets/tree/raw/`) to `src-assets/tree/` at repo root (keep webp in place; update nothing else; verify no HTML/CSS references the .png files first).

## 2. Brand (site.css, index.html) — Astra brand, Fable brand, Argon brand
- Hero canopy: lower it slightly so the top fruit clusters never brush the logotype: `max-height:62vh` and keep `bottom:-4%`; phones unchanged. Middle must read open.
- Collapsed accordion strips: deepen the overlay (`rgba(18,23,20,.85)` → `.45` top) and give vertical labels + Persian accents `text-shadow:0 1px 10px rgba(18,23,20,.95)`; labels 16px, tracking .06em; `.is-open{flex:5 1 0}` (update reserveHeight ratio).
- Desktop: hide the `<details>` summary where it is forced open (`@media (min-width:769px){html.site-ready .accordion__read[open] summary{display:none}}`); `.accordion__read p{color:var(--stone);font-size:16px;line-height:24px}`; intro stays parchment 18px. Phones: every Read more starts closed (first panel too).
- Pillars: three-row desktop grid (number / promise / supporting copy) with supporting copy aligned below the tallest promise (`grid-template-rows:auto 1fr auto` via subgrid or fixed min-height on h3).
- Teaser: one explicit spacing sequence; heading→kashida→options total 48–64px.
- Form: remove the thin rule above the first row (the `.form__note` border or hr); mobile drawer solid deep-cypress with a 2px gold top rule.
- Quote/parchment interludes: `border-block:2px solid var(--gold)`.
- `.band--glow::before`: raise to .10 and bias upward (`ellipse at 50% 30%`).
- SCROLL cue on desktop: move above the canopy line (`bottom:calc(42vh)` capped) or drop it; drop it.
- Phone `.hero__tag`: add the same text-shadow as `.hero__line`; `bottom:calc(24px + env(safe-area-inset-bottom))`.

## 3. Planner copy — Astra planner, Fable planner, Argon planner
- Split every "Call or WhatsApp" into two links: "Call (925) 263-9949" (tel:) and "WhatsApp" (wa.me) — drawer, `.hww-panel__foot`, footers.
- Desktop header ≥1100px: plain text link "(925) 263-9949" (tel:) before the Inquire button.
- Language line everywhere: "…Urdu, Hindi, Punjabi or the language your parents read, agreed in your proposal." Add Gujarati, Bengali and Tamil to the form's Preferred language select.
- how-we-work FAQ: "and mixed-heritage couples are welcome".
- how-we-work steps: after Proposal, one line on booking: "A signed proposal and the deposit hold your dates; an inquiry or consultation does not." #you-get: one short paragraph on simultaneous events, venue changes, delays and planner absence ("staffing and backup are named in your proposal").
- index #celebration-1 intro: "the mirror, the candlesticks, the sugar cones rubbed over the couple".
- Mehndi & Sangeet (index + weddings): add a nod to the dholki or jaggo; Haldi & Pheras / Anand Karaj (index): mention the milni as weddings.html does. Replace categorical phrases ("the sangeet is its own night", "elders' blessing first", "Seven circuits under the mandap" caption) with family-confirmed wording ("as your family keeps it").
- Form: summary text "Share your dates, guest count & traditions (optional)". After the celebrations closing link add an inline `<a class="btn" href="#inquire">Begin the conversation</a>`.
- Phone Pause button: add `.teaser` and `.journey` to the underFor array.

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals, no grid hairlines, no build tools. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-0/1/2/4.jpg, index-phone-0/1/2/4.jpg and fix anything visibly broken. Append "Round 8 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.
