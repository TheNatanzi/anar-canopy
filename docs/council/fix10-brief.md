# Fix pass 10 — consolidated from round 10 (Astra 8/8/7.8, Fable 8/8/8; Argon r9 9/9/9)

Sources: docs/council/results/r10-*.json (read for exact wording). Owner decisions in docs/council/RUBRIC.md stand. Keep the journey, the celebration list and the strip accordion.

## 1. Dev — Astra dev blocking, Fable dev
- Skip link: when the drawer is open, activating "Skip to content" closes the drawer first (shared anchor path), then focuses/scrolls main.
- Centralise background `inert`: one `syncInert()` that computes from BOTH overlays (nav-open, panel-open); resize can never clear inert while the panel is open; restore original state only when both are closed. Drawer gets the same Tab trap as the panel (or aria-hidden on inert targets).
- Initial hash: align the target below the fixed header even when its top is 0; skip only when already at the intended offset.
- Pause button on phones: instead of hiding it under the accordion/form, reserve space (`padding-bottom:64px` already on bodies) and keep it available while animated sections are visible; only hide while actively scrolling.
- reserveHeight(): batch writes, then reads, then restore (no alternating write/read per panel).
- Accordion: remove the focus-opens-panel handler (open on click/Enter/Space only; keep the :has() ring); add a 120ms hover-intent timer before open(p) on mouseenter.
- `.accordion__media img` sizes → `(max-width:1099px) 100vw, 480px`.
- Leaves: export the two used sprite regions of leaves-float.webp as `assets/tree/leaf-1.webp` and `leaf-3.webp` (~220×250, Pillow from src-assets/tree/leaves-float.png if present else from the webp) and point `.leaf--1/.leaf--3` at them.

## 2. Brand — Astra brand, Fable brand
- Phone hero canopy: `width:112vw; bottom:-4%` so both half-cut edge trunks stay visible at 390px (middle open); sync the `sizes`/`imagesizes` strings. Raise the tag pair clear of the Pause row: `.hero__tag{bottom:calc(64px + env(safe-area-inset-bottom))}` on phones.
- Phones: `.site-header.is-scrolled{background:var(--night)}` (solid; no blur there). `.accordion__media::after` top stop `.45` at ≤768px.
- Reorder stand-in photos so no two adjacent strips share a file: Haldi → pom-tree-night, Anand Karaj → pom-pile, Reception → pom-open-closeup (keep srcset variants consistent).
- Teaser: each option = start line + three short benefit lines; move contract/scope qualifications to how-we-work.html. Coordination eyebrow: "Begins 6–8 weeks out · we run the days you have planned"; first bullet: "Your family has planned already; we read every booking and confirm every time."
- Journey: each stage ONE short visible sentence (move the language sentence out; it lives in the footer + how-we-work).
- Form first row: two equal columns (names / email); phone on its own row under them (optional).
- Header Inquire turns ghost whenever another filled inquiry button is on screen (celebrations CTA, journey CTA, #inquire, footer) — extend the existing observer to all `.btn[href="#inquire"]`.

## 3. Planner copy — Astra planner, Fable planner
- Language FAQ (how-we-work): three clear lines: "Planning runs in English. Written pages for the parents are translated into the language you name. For calls and meetings in another language, tell us which one; we confirm who speaks it before booking." Keep the one-line promise only in the footer; the journey Proposal note loses it.
- "On the hard days" (how-we-work): concrete procedures instead of "the timeline is re-called": "Priorities and spending approvals are agreed in the proposal. If a venue changes or a vendor is late, we call the next option on the list we built together and tell the family lead first. If your planner is unwell, the named backup planner, briefed on your plan, runs the day."
- Mehndi & Sangeet intro: "Henna, blessings, music and dancing, across the gatherings your family chooses. We run each as your family keeps it."
- Haldi & Pheras intro: "The pheras under the mandap, with the pandit, at the muhurat your family's priest has set: your ceremony, in the sequence agreed with your officiant."
- Haldi & Pheras and Anand Karaj panels: gold English eyebrow in the Persian-accent slot: "Hindu ceremony" / "Sikh ceremony".
- Sofreh Aghd Read more: add before the sofreh-key sentence: "We cue the aghed and the family for the three 'bale': the bride has gone to pick flowers, then to bring rosewater, then, with her parents' permission, yes."
- Full planning: eyebrow "Begins once your proposal is signed · the first conversation is free"; pillar 02 muted + panel Consultation use the warmer line "Parents and elders included at the level you choose" (one wording everywhere).
- Celebrations: add a compact "Find your celebration" in-page link row above the accordion (six text links, gold, to each panel id) — keep the CTA after the panels.

Rules: night palette, TT Ramillas Bold, no catering/decor/rentals, no grid hairlines, no build tools. `node --check assets/js/site.js`. Then `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` (must print "40 shots; 0 errors") and Read docs/council/shots/index-desktop-0/1/2/3/4.jpg, index-phone-0/1/2/4.jpg and fix anything visibly broken. Append "Round 10 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.
