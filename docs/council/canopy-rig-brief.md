# Canopy branch rig — real per-branch animation (owner request)

Owner: "make each branch move individually … real animation, not a weird generic shake"; he hated the halo/"previous mark" from sliding tonal slices.

## Art (assets/tree/rig/*.webp, transparent, 2752×1536 unless noted; raw PNGs in src-assets/tree/rig/)
- backdrop.webp — dense dark fruit-free foliage U (static layer that fills every gap).
- Branches: b1–b8. Bases: b3, b4, b2 enter from the LEFT edge; b1, b5, b6, b7, b8 have their cut end on the RIGHT (b1's base is on the right even though it was asked left — mirror it with Pillow if you need a left branch). CLEAN-UPS with Pillow before use: b5 has a vertical trunk strip at its far right — crop it off at the branch's cut end; b7 has a faint dark rectangle background — re-key it (treat near-black #1x1x1x as background too) or threshold alpha; trim every sprite to its alpha bounding box and record the pivot (the cut end point) in a JSON manifest assets/tree/rig/rig.json {name, w, h, pivotX, pivotY, side}.
- Fruit: fruit1, fruit2 (single, stem at top centre), fruit3 (pair). CLEAN-UPS: fruit1 has trunk stubs at its bottom corners — crop to the fruit + stem only; fruit3 has a canopy painted in its lower half — crop to the top pair only. Pivot = top of the stem.

## Composition (index.html hero/screen-2 canopy, replacing the current canopy image region only; trunks, sprigs, band, roots stay as they are)
- Layer order back→front: backdrop (static) → 4 back branches (darker: brightness .85, slight blur .5px) → trunk junction bark (static, existing) → 4 front branches → 6–8 fruit sprites hung from front-branch tips (as children of their branch so they ride along).
- Place branches so the composite reads like the approved canopy: a U-shaped crown joined to both trunks, dense at the sides and across the bottom, the top-centre open, nothing over the logo or text. Left branches pivot at the left trunk, right at the right trunk. Measure against tree-full.webp and match its silhouette at rest (send a rest-state comparison image).

## Motion (GSAP, inside the canopy gsap context; Pause / reduced motion = fully static)
- Wind: each branch rotates about its pivot on its own sine loop (amplitude 0.6°–1.8°, larger for long branches; period 4.5–8s; random phase), plus a tiny secondary rotation on a second tween at a different period so it never looks mechanical. Back branches move less and slower than front ones (depth).
- Fruit: pendulum about the stem top, ±3°–6°, lagging the branch by ~0.25s (use a quickTo follower on the branch's rotation, or a separate offset sine).
- Scroll gust: on scroll velocity, add a gust that travels across the crown — branches nearer the scroll direction react first (stagger 60–90ms), each eases out and settles with one soft overshoot (no elastic wobble, no instant jumps). Cap one gust per 300ms.
- Parallax: back branches ×0.97, front ×1.02 of the canopy scroll — small, so depth shows without gaps (the backdrop covers any gap).
- 60fps: transforms only, will-change on the rig container ≥769px, quickSetters; no layout reads per frame.

## Verify
- Pixel/visual: rest-state composite vs tree-full canopy (docs/report/rig-rest-compare.jpg), and captures at 3 sway phases (docs/report/rig-sway-*.jpg) — no halos, no seams, no floating branch ends (every pivot hidden in the trunk or backdrop).
- Record a 6-second Playwright video of idle + a scroll gust → docs/report/rig.webm.
- `node --check assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0/1, index-phone-0/1.
- Append "Canopy branch rig" to docs/BUILD-NOTES.md. Do not commit; no backup files.
