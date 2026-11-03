# Anar Events website — morning report (Nov 3, 2026, 05:45)

**Site:** C:\dev\anar-site · run it from the Claude app launch config `anar-site` (http://127.0.0.1:5173) · 14 commits overnight.

## Council scores (0–10; 9 = "sign off for launch")

| Round | Astra planner | Astra brand | Astra dev | Fable planner | Fable brand | Fable dev | Argon planner | Argon brand | Argon dev |
|---|---|---|---|---|---|---|---|---|---|
| r1 | 5 | 5.5 | 5 | 6 | 7 | 7 | – | – | – |
| r4 | 7 | 7 | 7.5 | 7 | 8 | 7 | – | – | – |
| r6 | 7.5 | 7.5 | 7 | 8 | 8 | 8 | **9** | 8 | 8 |
| r9 | 8 | 8 | 8 | 8 | 8 | 8 | **9** | **9** | **9** |
| r11 (final) | 8 | 8 | 8 | 8 | 8 | 8 | (9) | (9) | (9) |

- Argon (Gemini) = 9/9/9 on round 9; its limit reset at 8:54 AM so round 11 was not re-run.
- Astra and Fable sit at a flat 8 for three rounds; their remaining asks contradict each other (e.g. keep vs. remove the journey, boxed vs. unboxed inputs). 10 fix passes, 11 audit rounds, 0 console errors, 0 overflow at 390px.

## What you have
- Home: video hero + gold logo + painted canopy (your U rule), trunks descend past the three promises, 6-panel celebrations strip, two-option service comparison, 5-step journey + celebration list, founder letter, roots floor + inquiry form.
- Weddings, How we work, About pages; slide-out "How we work +" tab; motion pause; phone layout.
- Self-hosted GSAP/Lenis/Noto Naskh; srcset images; a11y pass (focus traps, inert, reduced motion).

## Your to-dos (owner inputs)
1. Formspree: paste your form id over `FORMSPREE_ID` in index.html (one line).
2. Buy TT Ramillas Bold (~$64 Bold+Regular) and drop it in as `assets/fonts/TTRamillas-Bold.woff2` (trial file in use now).
3. Real photos (slots marked `PHOTO SLOT` in HTML), founder bio (about.html `.letter__bio`, hidden), one testimonial + proof line (index `.proof`, hidden), prices (how-we-work FAQ slot).
4. Hero video is stitched from other planners' films — stand-in only, not for the live site.
5. Persian proofread (native): میراث، از نو · آینه‌مصحف · شیرینی‌خوری · عروسی سیک · عروسی هندو · عروسی افغان · پاتختی · خینه (full list in docs/BUILD-NOTES.md).
6. Deploy: publish everything except `src-assets/` (PNG sources) and `docs/`.

## Spend
- Gemini paid API: ~$0.80 of the $1 cap (tree art). Everything else on your plans.
