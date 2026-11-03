# Canopy fix pass 5 — from council round 5 (Argon 9/8/9, Astra 8/7.5/6, Fable 8/8/8)

Sources: docs/council/results/canopy/r5-*.json. Owner decisions stand (layers + bounce, fruit sprites, tab, logo morph, icons). Keep motion; fix execution.

## 1. Blocking (Astra dev, Astra brand)
- Logo morph must never cross visible text: fade the descriptor line + tag pair fully BEFORE the moving logo's box reaches their bounds (compute from measured rects; the fade completes by the scroll position where the morph box's bottom meets the descriptor top). Verify at 1440×900, 1440×700, 390×844 with mid-scroll captures.
- Short phone viewports (390×700, 360×640): reserve header clearance + the actual hero content height before placing the canopy — effective hero height = max(100svh, header + content + 24px + first-foliage offset); nothing under the header.
- No-JS nav fallback: in normal flow (reserve its height; the hero placement accounts for it), contact rows inside the drawer.
- Fruit sprites "pasted": match both sprites (drop + roll) to neighbouring painted fruit — hue/saturation via a quick Pillow re-cut from the painted canopy (pick a fruit with its own shading, 2px soft edge, a faint cast shadow baked in) and drop the CSS filter.
- kill(): `gsap.set(layer,{clearProps:'transform'})` for each layer; clear `.logo-morph` inline transform/width; register callback-driven sets inside the context.

## 2. Polish (brand + dev)
- Hero: top scrim `linear-gradient(rgba(27,34,30,.55) 0, rgba(27,34,30,0) 180px)` layered above the tint; halo `radial-gradient(closest-side, rgba(27,34,30,.85), rgba(27,34,30,.5) 55%, transparent 80%)`; deepen finishes by 80% of the hero.
- Phone tag pair: each sentence in its own nowrap span ("Honoring the roots." / "Elevating the vibe."), Persian on its own line; phone number text over the video in parchment (gold on the solid header).
- Promises: remove the repeated short rules above the promise lines and card titles (keep heading kashidas + title underlines); `text-wrap:balance` on `.promises li`.
- Statement screen: `padding-top: clamp(140px,18vh,220px)` ONLY if the block stays inside the open gap (measure; otherwise keep); `.screen--inquire` padding-top `clamp(64px,9vh,110px)`; phones `--gutter: clamp(24px,7vw,40px)`.
- `.tree__band`: inner-edge shade layer so the bark reads behind the sprigs; `will-change` on the four layer divs only (not imgs); `loading="lazy"` on the trunk/sprig/ground tree-full imgs; measureMorph reads rects with transitions disabled; `font-synthesis:none` on body and `.fa`.
- Tab: reserved right gutter applies to every inner-page container where the tab can appear (section heads included).
- Form: `invalid` capture → aria-invalid + `.field__error` with aria-describedby; message helper ends "…and the language your parents prefer."; Call / WhatsApp line sits directly above the form under the heading divider.
- Move repeated inline margin tweaks on inner pages into 2–3 utility classes.

## 3. Copy (planners) — exact wording in the JSONs
- weddings: conditional framing per section ("For the rituals you choose, we confirm the order and participants…"); two visible coordination sentences per ceremony, long cue lists inside the existing details; one spelling "muhurat" + "the muhurat your family's priest sets"; "the mahr as agreed by the couple and confirmed with their officiant"; Afghan block gets id="afghan" + "Afghan weddings" in the Find-your-ceremony row, placed before the nikah details; Sofreh first paragraph in ritual order (three-time ask + baleh → kaleh ghand during the reading → honey); add Urdu/Arabic script accents (ولیمہ / رخصتی) and Gurmukhi/Devanagari accents on the South Asian sections.
- how-we-work: "every wedding day run" → "the wedding events agreed in your proposal" (FAQ too); the partial/multi-event note becomes a third grid card.
- index: Nikah figcaption "The contract before both families; the Afghan aina mosaf."

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-desktop-0..4, index-phone-0..4 + Playwright mid-scroll captures of the morph (logo never over text). Append "Canopy round 5 fixes" to docs/BUILD-NOTES.md. Do not commit.
