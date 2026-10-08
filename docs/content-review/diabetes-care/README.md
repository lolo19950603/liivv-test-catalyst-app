# Diabetes Care microsite — content review
**Prepared for:** Liivv management and clinical review  
**Covers:** the landing page of `/liivv-health/diabetes-care`, the chapters the shared chapter engine serves, the Funding & Coverage page and the five path pages, in English and French  
**Generated:** 2026-10-08 from commit `f7f9ef0b`

> **These files are generated from the site's own sources.** Do not edit them. Mark corrections against the reference beside each line — the change is made in the source, and the files are generated again. That way the text you approve is the text that ships, and the two cannot drift apart.

## How to review

1. Start with the English files. The English has been checked against its sources, and no clinician has signed it off yet: no page carries a byline or a review date.
2. Each chapter file ends with **Questions for the nurse** — the defaults the copy uses where the sources disagree, each with where it appears and the alternative — and **Held for want of a source**, the wording left out and why. Rule on those first.
3. The French is machine translated and nobody has reviewed any of it. In the French files, lines marked ⚑ show on /fr now with no review gate in front of them; the rest wait behind one of the gates listed below.
4. For each correction, give the file and the reference — for example *02, card 8, `8.s4.1`* — and the corrected wording.
5. Every card lists the sources its sentences rest on, and every file ends with a table of them: publisher, type and the passage cited. A manufacturer-run (industry) source is never the only source for a claim.

## Files

| File | Page | Words (EN) |
|---|---|---|
| [00-shared.md](en/00-shared.md) · [FR](fr/00-shared.md) | Shared interface text | 1,329 |
| [01-new-to-the-journey.md](en/01-new-to-the-journey.md) · [FR](fr/01-new-to-the-journey.md) | Chapter 01 — New to the Journey | 2,340 |
| [02-staying-safe.md](en/02-staying-safe.md) · [FR](fr/02-staying-safe.md) | Chapter 02 — Staying Safe | 2,511 |
| [03-your-tools.md](en/03-your-tools.md) · [FR](fr/03-your-tools.md) | Chapter 03 — Your Tools | 3,238 |
| [04-every-day-living.md](en/04-every-day-living.md) · [FR](fr/04-every-day-living.md) | Chapter 04 — Everyday Liivving ✎ | 3,433 |
| [05-know-your-type.md](en/05-know-your-type.md) · [FR](fr/05-know-your-type.md) | Chapter 05 — Know Your Type | 3,654 |
| [06-this-might-be-you.md](en/06-this-might-be-you.md) · [FR](fr/06-this-might-be-you.md) | Chapter 06 — This Might Be You | 1,825 |
| [07-landing.md](en/07-landing.md) · [FR](fr/07-landing.md) | Landing page | 1,552 |
| [08-funding.md](en/08-funding.md) · [FR](fr/08-funding.md) | Funding & Coverage | 5,905 |
| [09-paths.md](en/09-paths.md) · [FR](fr/09-paths.md) | Path pages | 2,830 |
| | **Total** | **28,617** |

## Open with the nurse

- [01-new-to-the-journey.md](en/01-new-to-the-journey.md): 1 open rulings (N12), 12 held items
- [03-your-tools.md](en/03-your-tools.md): 1 open rulings (R16), 23 held items
- [04-every-day-living.md](en/04-every-day-living.md): 1 open rulings (D14), 15 held items
- [06-this-might-be-you.md](en/06-this-might-be-you.md): 1 open rulings (M9), 18 held items
- [07-landing.md](en/07-landing.md): 11 open questions for the owner, the nurse, operations and engineering (D3, D5, D10, D12, D14, D15, D16, D18, D21, D22, D23), 8 held items
- [08-funding.md](en/08-funding.md): 8 open questions for the owner, the nurse, operations and engineering (D-2, D-4, D-12, D-19, D-20, D-23, D-26, D-27), 9 held items, 14 sources proposed for the register
- [09-paths.md](en/09-paths.md): 8 open questions for the owner, the nurse and content (Q3, Q4, Q8, Q9, Q10, Q15, Q18, Q21), 8 held items, 1 sources proposed for the register

## What is not in these files

- The site header.
- What the shop strips show on the day. Each chapter card, path and the funding page lists the products its strip names (chapter-shop.ts; B21), but the catalogue decides on each request which of them render: only products the store shows, sells and has in stock, and never one whose description names or links another retailer. No kit is listed (A4).

## Waiting on French review

On /en now, hidden on /fr until a francophone reviewer signs off the French. The card keeps its plain list, so /fr loses a module rather than a sentence, and no gate removes an urgent, emergency or crisis line. The owner opens a gate by adding its id to `FR_REVIEWED` in `diabetes-care/chapters/review-gates.ts` after the sign-off. On local development and Vercel previews every gate is open, with a visible draft marker.

- `glucoseRange` — `glucoseRange`, Chapter 01, card 3
- `laneExtras` — `lanes`, Chapter 01, card 11 — its tick boxes, its link labels and every lane with no sentence of the card's own; `lanes`, Chapter 02, card 11 — its tick boxes, its link labels and every lane with no sentence of the card's own
- `bandLinks` — the referral band's links, Chapter 01; the referral band's links, Chapter 03
- `ruleOf15` — `ruleOf15`, Chapter 02, card 2
- `ketoneLadder` — `ketoneLadder`, Chapter 02, card 7 — on an urgent card, so it renders on /fr anyway and its French is live; the gate decides only the draft marker on previews
- `meterMatch` — `meterMatch`, Chapter 03, card 2
- `sensorPicker` — `sensorPicker`, Chapter 03, card 4
- `restockCalc` — `restockCalc`, Chapter 03, card 6
- `rotationMap` — `rotationMap`, Chapter 03, card 10
- `pumpPicker` — `pumpPicker`, Chapter 03, card 13
- `shelf` — the resources shelf, Chapter 04
- `cluesChecklist` — `cluesChecklist`, Chapter 05, card 6
- `testGlossary` — `testGlossary`, Chapter 05, card 6
- `familyTree` — `familyTree`, Chapter 05, card 8
- `doors` — the situation doors on the landing page — on /fr in production the section shows only the emergency route, in words the chapters already carry
- `landing` — the landing page's own French — it ships on /fr flagged as machine translated, so this gate decides only the draft marker on previews
- `funding` — the Funding & Coverage page's own French — it ships on /fr flagged as machine translated, so this gate decides the draft marker on previews, and whether the page's /fr URL is in the sitemap
- `fundingChecker` — the funding checker — on /fr in production the section shows a plain list of each province's programs instead, each linked to its official page with the date it was checked
- `paths` — the five path pages' own French — it ships on /fr flagged as machine translated, so this gate decides the draft marker on previews, and whether the paths' /fr URLs are in the sitemap
- `shop` — the Diabetes Essentials shop's own French (its headings, filter labels and product-type names) — it ships on /fr, so this gate decides only the draft marker on previews

`chapter:<slug>` gates are declared in `review-gates.ts`, but no page checks them today: a chapter's French shows on /fr as soon as it is in `fr.json`, as the landing's does, which is why every line of either outside the gates above is marked ⚑.

## Regenerating

```bash
node --env-file-if-exists=.env.local core/scripts/export-content-review.mjs --site=diabetes-care
```

Coverage check on this run: **2163 of 2163** English strings under `DiabetesCare` appear in these files.
