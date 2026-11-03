# Anar Events website — council rubric (9 seats)

You are one seat on a nine-seat council auditing a static website for Anar Events, a wedding planning and coordination studio for Persian, Afghan and South Asian families in the San Francisco Bay Area. Three models (Codex Astra, Claude Fable or Claude Opus, Gemini Argon) each hold three seats:
- **Wedding planner** (knows Persian, Afghan and South Asian weddings and the families who pay): does the site win trust and inquiries from couples AND parents? Is the cultural fluency real, respectful, not costume? Is the path to "Inquire" obvious?
- **Brand creative lead**: does it feel like the Anar brand book (night palette first: cypress #1B221E, parchment #F9F6F0, gold #C99E5C, ruby #6D1A24; TT Ramillas Bold; the plain gold logo never retyped; the kashida line; the painted pomegranate tree that frames the edges and bottom but never covers the middle)? Premium? Alive with motion but never gimmicky? No grid hairlines.
- **Web developer**: code quality, motion implementation (GSAP/ScrollTrigger/Lenis), performance (lazy loading, no layout shift, video weight), mobile at 390px, accessibility (landmarks, focus, reduced motion, contrast), no console errors, no horizontal overflow.

Hard rules the site must obey (score ≤6 if broken): nothing about catering, decor or rentals; the hero shows the plain gold logo (no web address) readable over the video; the tree art frames edges and bottom only, middle open; English only (Persian accents allowed); TT Ramillas Bold for Latin text; night palette first.

Score 0–10. 9 = "I would sign off for launch with trivial nits". 10 = world class. Be harsh and specific.

Reply ONLY with JSON: {"model":"<astra|fable|opus|argon>","role":"<planner|brand|dev>","score":<number>,"blocking":["..."],"fixes":[{"where":"file:line or section","what":"exact change","why":"one line"}]} with at most 6 fixes, most important first.

## Owner decisions (do NOT score these down; they are deliberate)
- The inquiry form posts to the placeholder `FORMSPREE_ID` until the owner pastes his Formspree ID. Judge the form's fields, labels, validation and error handling, not the endpoint.
- Real wedding photos arrive later from the owner; the pomegranate photos are stand-ins. Judge the slots, captions and layout, not the stand-in subject.
- The hero composition is approved by the owner: full-bleed video, plain gold logo with a soft halo, the painted canopy rising from the bottom as ONE connected piece with half-cut trunks at the edges, open middle. Judge execution, not the concept.
- The persistent vertical "How we work +" tab (dark, like white-desert.com) is the owner's choice on this Canopy build; judge placement and behaviour, not its existence. Hard rule: artwork, sprites and controls never cover the logo, text, buttons, inputs or the footer.
- CANOPY VERSION (this build): the home page is deliberately a condensed white-desert.com-style scroll down ONE painted tree across four screens (canopy at the bottom of screen 1, canopy at the top of screen 2, trunks both sides on screen 3, roots and ground on screen 4). Home copy is capped at ~120 words; detail lives on the inner pages. Do NOT ask for more sections, more copy, journeys, FAQs, comparisons or proof blocks on the home page; judge the execution of this concept (art continuity, motion, readability, mobile, speed, accessibility) and the inner pages.
- The copy lines "Reimagined Heritage", "Honoring the roots. Elevating the vibe.", "Timeless traditions, curated for the modern era.", "Keep the soul. Redefine the style.", the three "We are always…" promises and the short pitch ("…obsessed with the modern aesthetic you actually want") are the owner's words. Judge where and how they are used, not the wording.
- TT Ramillas Bold is served from a trial file until the owner buys the licence (same filename swap, noted in BUILD-NOTES). Judge the typography, not the licence.
- The inquiry form fields, the hero video footage (stand-in until the owner's own film exists) and the Persian strings awaiting a native proofread are owner inputs. Judge structure and placement.
- The founder biography, proof lines (number of weddings, testimonials) and real photos are owner inputs that arrive later; a clearly marked slot is acceptable. Judge placement, not the missing facts.
