# Canopy fix pass 4 — from council round 4 (Argon 9.5/9/9.6, Astra 8/7/6, Fable 8/8/8)

Sources: docs/council/results/canopy/r4-*.json. Owner decisions stand (layered canopy with bounce, falling/rolling fruit, tab, logo morph, icons). Don't remove motion; tune it.

## 1. Layered canopy defects (Astra brand blocking, Fable brand)
- "Doubled fruit / translucent foliage" in desktop shot 2: the base layer L0 has been regenerated WITHOUT the fruit/bright-leaf regions (assets/tree/layers/canopy-L0.webp is new) — reload it. Also cap the parallax offsets so layers never drift more than ~8px apart at any scroll (×0.985/0.993/1/1.008), and make the bounce gentler: kick threshold |velocity| > 900, cooldown 400ms, amplitudes 4/6/8px (2/3/4 on phones), ease power2.out then a soft settle (no visible elastic overshoot).
- Falling fruit: drop spin to ~40° total and no rolling 220° entrance (a short 30° nudge).
- Provide 768 / 1024 / 1536 variants for all four layers (Pillow) with srcset + `sizes="(max-width:768px) 110vw, 100vw"`; preload canopy-L0 + L1 (fetchpriority high, reduced-motion media) and drop the tree-full preload; `decoding="async"` on all layer imgs; `gsap.quickSetter` for the per-frame y instead of gsap.set; cache the in-view flag from the IntersectionObserver instead of getBoundingClientRect per frame.

## 2. Header / tablet (Astra dev blocking)
- Keep the drawer navigation through 1024px; the full desktop header (centred logo + icons + Inquire) activates at 1025px. Separate the nav breakpoint from the desktop-motion breakpoint; verify 820×1180, 1024×768 and 1025.
- Tablet `.cel` overrides (769–1024) must come AFTER the base `.cel` rule (two equal columns + centred third card).
- `.motion-toggle` hit area 44px (visual can stay 36px via ::after inset:-4px); tab: when keyboard focus reaches it, un-hide immediately and sync tabindex; measure the rendered tab at 390px and set an explicit width 36px with the label fitting; on phones hide the tab while `.cel` is in view (add to hideFor) and give `.cel figure` padding-right so slots end 44px from the edge.
- `scrollToEl`: `onComplete: settleReveals()`.

## 3. Brand polish (Argon brand, Fable brand, Astra brand)
- `.site-footer__bottom` rule 2px gold .35; `.hero__halo` rgba(27,34,30,.75) height 190%; `.inquire__call` margin-bottom var(--s2) (or --form-reserve 490·s); `.hww-tab` box-shadow -4px 0 16px rgba(18,23,20,.6); centre `.form__note` under the centred submit; email/phone inputs with a clear gap between underlines; phones: first foliage at 52% of the hero (`--tree-top: calc(var(--hero-h)*.52 - 169*var(--s))`).
- Hero tag pair vs screen-2 h2 both say "Reimagined Heritage": keep the h2; hero tag pair becomes the Persian only + "Honoring the roots. Elevating the vibe." as the English twin.
- Wide desktops ≥1200px: show "(925) 263-9949" in 14px gold after the handset icon.
- Ceremony titles on screen 3: persistent subtle gold underline (affordance).

## 4. Copy (planners) — exact wording in the JSONs
- weddings Sofreh: "the sugar cones rubbed together over the cloth held above the couple"; mention the three "baleh" timing (playful three-time ask) as coordination. Haldi & Pheras: name kanya aagman and the parents' role (kanyadaan), plus one line naming regional variants (Gujarati, Punjabi, South Indian: saptapadi, mangalsutra, the muhurtam your family's priest sets). Nikah paragraph 1: cut the Afghan shirni-khori/aina-mosaf sentence there (it lives in the Afghan note) and use "For families who include mehndi or rukhsati, we agree their timing with you and your officiant." Each ceremony section leads with the concrete coordination work; longer ritual description moves into a native `<details>` "Details we confirm with your family".
- how-we-work: reconcile "Always included" vs proposal-dependent deliverables (state which are always included); "A venue change…" → "We assess the impact, confirm available alternatives and any spending approval, then re-issue the timeline."; FAQ cost: owner-input slot line "Full planning from $X · Wedding-day coordination from $Y" (hidden until filled, data-owner-input); a third note under the two options: partial / multi-event planning is quoted the same way.

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0..4, index-phone-0..4 + one inner shot: no doubled fruit, header fine at 1024/1025, nothing covered. Playwright: capture the canopy mid-scroll at 3 offsets and confirm no ghost fruit. Append "Canopy round 4 fixes" to docs/BUILD-NOTES.md. Do not commit.
