# Fix pass 3 — my own visual notes (from r2 shots, 02:55)

1. Sticky header is translucent: page content bleeds through behind nav (index-desktop-4 checkboxes, how-we-work-desktop-1 text). Give `.site-header.is-scrolled` an opaque cypress background (or blur + 92% alpha) so text never collides.
2. Phone hero (index-phone-0): "Pause motion" labelled pill + SCROLL cue + Persian tagline all sit on the canopy band, 4 elements in 120px. Make the motion toggle icon-only on phones too (same as desktop), move tagline above the scroll cue, or hide the tagline on ≤480px.
3. Phone header: "به‌زودی" wraps under فارسی at 390px. Hide "· به‌زودی" below 480px (keep visually-hidden text).
4. Phone hero canopy: top of canopy at ~78% of viewport — fine, but video darkness makes the descriptor hard to read over the roses. Slightly stronger bottom gradient on phones.
5. Inner pages: after Astra's pass, re-check `.hww-tab` does not overlap the How we work timeline at 1440 (it sits over the right margin — fine).
6. Gemini Argon, Pro and Flash all rate-limited until 3:54 AM Nov 3 → Argon seats run after that on round-3 shots.
