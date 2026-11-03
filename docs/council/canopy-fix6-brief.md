# Canopy fix pass 6 — from council round 6 (Argon 9.5/9.6/9.6, Astra 6/6/6, Fable 8/8/8)

Sources: docs/council/results/canopy/r6-*.json. Owner decisions stand.

## 1. Rule fix (all three Astra seats capped on it)
- weddings.html: REMOVE the Hindi, Punjabi and Urdu script accents (lang="hi"/"pa"/"ur" spans and their CSS rule). English names only; Persian accents stay. (The rubric's "English only, Persian accents allowed" is the owner's rule.)

## 2. Dev (Astra dev, Fable dev)
- Tab: inquiry/footer collision protection takes precedence over focused-tab visibility (when a focused tab must hide, move focus to the next focusable element first).
- Form: `el.validity.valid` during input; checkValidity/reportValidity only on submit; firstInvalid lookup after reportValidity; refresh ScrollTrigger/Lenis after validation messages / status / textarea growth change the form height.
- canopy.js: run fitHero() + its listeners whenever main.canopy exists (gate only animation on gsap); create the morph ScrollTrigger before the text trigger (no measureMorph() inside textFadeEnd); `.tree__bark` img loading="lazy"; `html.canopy-motion` will-change scoped to ≥769px.
- Delete the unreferenced generated layers assets/tree/layers/L1-back/L2-mid/L3-front/L4-fore.webp (move to src-assets); remove `loading="lazy"` from the footer logo on all pages.
- `.cel` img sizes `(max-width:768px) min(100vw,420px), 330px` and ship a 4:5 crop for the landscape pom-open-closeup (Pillow) used in that slot.

## 3. Brand (Fable brand, Argon brand)
- Fix the stale comment above the statement padding rule (it now says 40–72px by owner choice).
- Phone hero ramp reaches solid night earlier: `rgba(27,34,30,.42) 0%, rgba(27,34,30,.72) 55%, var(--night) 82%`.
- Remove the detached leaf on screen 3 (or tuck it fully inside the trunk, right:8px rotate(18deg)).
- `.inquire__call` underline rgba(201,158,92,.45); `.site-footer__lang` .72; `.hww-panel` radius 2px on phones; `.nav-home` phone width formula `min(120px, calc(100vw - 250px))`.
- Hero tag: Persian twin on its own line under the English on desktop too (centred).
- Phone band: add the desktop inner-edge shade in front of the 25% tint.

## 4. Copy (planners)
- Three options must be consistent: define when Partial planning begins + 3–4 concrete deliverables in a `<details class="option__more">`; replace "either option" wording with "every option"; "Already have a venue coordinator? We agree who runs what, in writing."
- index Nikah caption: "The contract before both families; the aina mosaf for Afghan families."; `.cel__foot`: "Hindu and Sikh families: haldi and pheras, Anand Karaj. Pakistani, Afghan and Bengali families: nikah, walima, rukhsati. Every ceremony on the Weddings page."
- weddings: Nikah paragraph in actual sequence ("the mehndi the night before and the rukhsati after the nikah…"); Reception & Walima details mention hospitality and dietary logistics coordination; a quiet call line under the jump row (same as the home `.inquire__call`).
- how-we-work Partial planning details as above. Message textarea placeholder: "e.g. Fall 2026, ~250 guests, Sofreh Aghd & Walima, Persian/Dari for parents".

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0..2, index-phone-0..2, weddings-desktop-2. Append "Canopy round 6 fixes" to docs/BUILD-NOTES.md. Do not commit.
