# Canopy fix pass 8 — from council round 8 (Astra 8/8/8; Fable + Argon unavailable: credits)

Sources: docs/council/results/canopy/r8-astra-*.json. Owner decisions stand: KEEP the bounce (owner asked for it), the statement padding (40–72px), the layered canopy, fruit, tab, logo morph.

## Dev (blocking)
- Reduced motion (both `.reduced` and `prefers-reduced-motion: reduce`): no hover translation on buttons, no scale on celebration images/links — static, not just instant.
- Inquiry response: keep the live status announcement, but move focus to the status only if focus is still on the submit button.
- `moveFocusOff()`: filter candidate controls by their OWN viewport bounds, not only the section's.
- `applyMorph()`: cache the previous morphing/docked state; toggle root classes only on change.

## Brand / layout
- Phones: remove the extra right padding on the inquiry form (tab already hides in #inquire); equal side gutters.
- Phones: reduce the empty interval beneath the canopy so the next heading starts shortly after the hanging fruit clears (measure; keep ≥16px clearance).
- `.hero__halo`: reduce the outer reach (keep logo/text contrast), so the video midtones read outside the clearance area.
- weddings `.tradition__title`: headings take the full text-column width; the Persian accent drops beneath the heading when both don't fit on one line.

## Copy (planner)
- how-we-work "Selected-event planning": state plainly that it includes budgeting for those events, venue/vendor sourcing and booking support, plus running the days (if that is the intended scope — it is).
- how-we-work Consultation: distinguish the couple's approval of ceremony and personal choices from the payer's approval of spending ("The couple approves ceremony and personal choices; whoever is paying approves spending.").
- weddings ceremony openings: two short coordination sentences visible; the rest inside the existing details.

Verify: `node --check assets/js/site.js assets/js/canopy.js`; `cd /c/dev/anar-site && PYTHONIOENCODING=utf-8 python docs/council/shots.py` → "40 shots; 0 errors"; Read index-phone-1/2/4, index-desktop-0, weddings-desktop-1. Append "Canopy round 8 fixes" to docs/BUILD-NOTES.md. Do not commit; no backup files.
