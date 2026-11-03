# Canopy version — home page brief (branch `canopy`)

Medi's original vision: a condensed white-desert.com feel. ONE tall painted tree, four screens high, and you scroll down it.
The artwork is `assets/tree/tree-full.webp` (1536×3714, transparent; canopy top ~33%, trunks at both edges, roots + ground bottom ~20%).
Inner pages (weddings, how-we-work, about) and the shared header / panel / footer stay as they are. Only the HOME page changes.

## The four screens (desktop 1440×900; the tree is `width:100vw`, so it is ~3480px tall ≈ 4 screens)
| Screen | Tree | Content in the open middle (short!) |
|---|---|---|
| 1 | full-bleed looping video (existing hero video + poster), the canopy rising into the bottom quarter | plain gold logo (existing `.hero__mark` block without the halo plaque), one descriptor line, tag pair |
| 2 | canopy across the top (the rest of it), trunks begin at the edges | "Reimagined Heritage" + ONE sentence + the three promises as three short lines (no cards, no boxes) |
| 3 | trunks both sides, bare middle | Celebrations: three big photo slots (stand-ins: pom-open-closeup / pom-in-hand / pom-tree-night), each with a title + ONE line; link "Every tradition, in its own words" → weddings.html |
| 4 | roots and ground | Inquire: names, email, message, button; "Call (925) 263-9949 · WhatsApp"; footer below the ground |

Rules: night palette; TT Ramillas Bold; no catering/decor/rentals words; no grid hairlines; middle stays open; nothing covers the logo.
Total home-page copy ≤ 120 words. Everything else lives on inner pages.

## Build
- New `index.html` on the `canopy` branch (keep `<head>`, header, skip link, hww tab/panel, motion toggle, footer markup from the current index). New CSS in `assets/css/canopy.css` (loaded after site.css, home only) and JS in `assets/js/canopy.js` (loaded after site.js, home only). Do NOT edit site.css/site.js except to neutralise home-only rules that would conflict (prefer overrides in canopy.css).
- Layout: `<div class="tree">` absolutely positioned, `top:0; left:0; width:100vw; height:auto`, containing `<img src="assets/tree/tree-full.webp">` with `width/height` attributes; the page's `main` gets `min-height` equal to the tree height (set via CSS aspect-ratio: `height:calc(100vw * 3714 / 1536)`). The four content screens are `section.screen` blocks of `height:25%` of that (or `min-height:100svh` each, whichever keeps the tree aligned — align to the tree, since the art is the thing).
- The tree's TOP must sit so the canopy's underside reaches the bottom quarter of screen 1: set the tree layer `top` so the canopy foliage starts at ~72% of screen 1 (measure the art: foliage starts ~50px from the tile top, so `top: calc(72vh - 50px * (100vw/1536))`). The page then extends below screen 4 only by the footer.
- Video: `position:fixed` behind everything for screen 1, fades out (GSAP scrub) as screen 2 arrives; poster fallback; same load gating as today (block 0 in site.js) — reuse the `<video class="hero__video">` markup and the existing loader.
- Phones (≤768): the tree is `width:200vw` centred (`left:-50vw`) so trunks still frame the edges; screens follow the tree height; copy centred, 20px gutters; video only on screen 1.

## Motion (GSAP + ScrollTrigger + Lenis already loaded; respect the existing motion toggle + reduced motion)
1. Parallax: the tree layer moves at 0.9× scroll (content 1×) via a scrub tween — subtle depth.
2. Sway: split the canopy into its own layer by CSS clip (`.tree--canopy` = same image, `clip-path:inset(0 0 67% 0)`) and give it a slow sine sway (`rotate ±0.5deg`, `transform-origin:50% 0`, 7s yoyo) plus a scroll-velocity "shake": on Lenis velocity > threshold, add a short GSAP tween `x:±6px, rotation:±0.8deg` that eases back (the shrubbery/branches on the trunks can use two small clipped layers too, 9s/11s periods).
3. Leaves: 3–4 drifting leaf sprites (existing `assets/tree/leaf-1.webp`, `leaf-3.webp`) across screens 2–3.
4. Falling pomegranate: cut one fruit from the art as a sprite (Pillow: crop a clean fruit from tile-B at the canopy, ~90px, keyed; save `assets/tree/fruit-drop.webp`), place it on a canopy branch on screen 2; a ScrollTrigger scrub from 1.1 to 1.9 screens makes it drop (y += 1.6 screens, rotation 140°, slight x drift, ease power2.in) and fade in the last 10%. A second fruit rolls on the ground on screen 4 when it enters (small x nudge + rotation).
5. Gold kashida lines draw in under each title as it enters; logo + line fade/rise on load; the roots layer rises 40px into place on screen 4.

## Verify
- `node --check assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` must print "40 shots; 0 errors"; Read index-desktop-0..4 and index-phone-0..4 and fix anything broken (canopy covering logo, text over trunks, seams visible, empty screens).
- Also save a full-page capture for Medi: Playwright `page.screenshot(full_page=True)` of the home at 1440 wide → `docs/report/canopy-fullpage.jpg` (JPEG q80), and at 390 → `docs/report/canopy-fullpage-phone.jpg`.
- Do not commit. Do not touch the inner pages, assets/video, assets/tree/*.png, docs/council/results.
