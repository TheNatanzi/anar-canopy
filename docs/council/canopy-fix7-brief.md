# Canopy fix pass 7 — from council round 7 (Argon 9.5/9/9.6, Astra 6/6/8, Fable 8/8/8)

Sources: docs/council/results/canopy/r7-*.json. Owner decisions stand (statement padding stays 40–72px).

## 1. Hard-rule fix (Astra brand + planner capped on it)
- weddings.html #reception-walima: DELETE the "Hospitality and dietary logistics…" paragraph entirely (no halal/vegetarian/dry-bar/served-first wording anywhere — catering stays unsaid). Grep all pages for food/menu/catering/dietary words and remove.

## 2. Screen 3 cards (Fable brand/dev, Astra brand)
- `.cel{align-items:start}` / `.cel figure{align-content:start; grid-template-rows:auto 1fr}`; Persian labels share one 24px box; title link `display:inline-block`; captions ≤2 lines at 330px (Nikah: "The marriage contract; aina mosaf where your family observes it."); slot width calc(22vw) / 260px min; phones: drop `.cel figure` from the right-clearance rule (tab already hides there).
- `.cel__foot`: "Explore haldi, pheras, Anand Karaj, nikah, walima and more on the Weddings page." (no demographic lists).

## 3. Dev / polish (Argon dev, Fable dev, Astra dev)
- Scrolled header alpha .985 on pointer desktops (keep blur), .96 where blur is off.
- Move the `.hww-tab` button right after `</header>` in the DOM on all pages (panel/backdrop can stay at the end).
- Preload the canopy layer images only without reduced motion (`media="(prefers-reduced-motion: no-preference)"`).
- ghostObserver: compute destination visibility in a shared function, run on observer updates AND on load/refresh (`syncTab(true)` immediately).
- `scrollToEl`: `immediate:true` when reduced || userPaused.
- Form: `form.noValidate = true` after installing the custom handlers.
- Re-encode canopy-L1 / L2 WebPs at lower quality (q74) — they sit behind L3.
- Bounce: animate from the current y to the offset then settle (no instantaneous jump).
- Nested text containers on inner pages keep the tab clearance (About "What anar means" block etc.).
- `.field input` background rgba(18,23,20,.35), radius 2px 2px 0 0.
- Falling fruit: end the fall behind the left trunk shrub instead of fading in the last 10% (if clean), else keep.

## 4. Copy (planners)
- weddings lede: "Elders seated first, at every ceremony, as your family wishes."; Nikah paragraph: add "For Pakistani families: the nikah, the rukhsati and the walima, each in its own time." ; Haldi details: mention vidhi/pithi and jai mala/varmala; Anand Karaj details: Ardas and Karah Parshad.
- how-we-work step 02 + panel: "Parents and elders included at the level your family agrees together."; rename "Partial planning" → "Selected-event planning" (same scope text); FAQ: how gurdwara/mandir/masjid moments are coordinated with the venue's own staff.
- index `.form__note`: "We reply within one business day, by email, or by phone if you prefer."

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-2, index-phone-2, weddings-desktop-3. Append "Canopy round 7 fixes" to docs/BUILD-NOTES.md. Do not commit.
