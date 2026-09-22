# Ostomy microsite — content review
**Prepared for:** Liivv management and clinical review  
**Covers:** every page of `/liivv-health/ostomy-care`, in English and French  
**Generated:** 2026-09-22 from commit `14aa9991`

> **These files are generated from the site's own sources.** Do not edit them. Mark corrections against the reference beside each line — the change is made in the source, and the files are generated again. That way the text you approve is the text that ships, and the two cannot drift apart.

## How to review

1. Start with the English files. The French is machine translated with partial human correction and needs a separate francophone clinical review.
   In the French files, lines marked ⚑ show on /fr now with no review gate in front of them — French rewritten to follow a correction to the English or to match the glossary beside a new module, and the emergency signposts, which no gate may hide. Review those first; everything else new on /fr waits behind one of the gates listed below.
2. For each correction, give the file and the reference — for example *02, card 18, `18.s1.2`* — and the corrected wording.
3. Check the **Referral chip** and **Products shown** lines under each card as well as the text. A product beside a card is a claim too.
4. Funding figures change. Check each against its official source and note the date you checked.

## These pages render without JavaScript

**This was a ship blocker on the last pack, and it is fixed.** With JavaScript disabled or blocked, a reader now gets the page: the heading, every card, the walk-through steps, Chapter 02’s emergency red-flag list with all of its signs, and the 9-8-8 crisis line on the two chapters that carry it. That was checked page by page, in a browser with scripts switched off, on every page in this pack in both languages.

What changed: one file, `core/app/[locale]/(default)/loading.tsx`, wrapped every route in this part of the store in a Suspense boundary, so the body of each page arrived in the HTML inside a `<div hidden>` that only an inline script moved into view. That file has been removed. Measured the same way as before — stripping scripts and styles from the served HTML and comparing the text inside those containers against the text outside them — the share of each page that sits inside them has gone from between 84% and 95% to between 3.8% and 14.7%. What is left inside is the site header and the footer, which this pack does not cover; see "What is not in these files". That is the same block of words on every page, so it is a larger share of a short page than of a long chapter — 14.7% on the landing page, 3.8% on the longest French chapters. Every word this review covers is now outside.

**The second copy of the emergency wording is gone, and what each page carries instead is not the same on every page.** Chapter 02’s emergency red-flag list and the 9-8-8 crisis sentence used to be rendered a second time inside a `<noscript>` on every `/liivv-health/ostomy-care/**` page, because while the rest of the page stayed hidden those were the two things a reader could not afford to lose. The pages render their own content now, so that duplicate has been removed rather than left to show twice, and the one sentence it owned — "This page needs JavaScript to show its content…" — is gone from the site and from these files. What that leaves, page by page:

- **The red-flag list.** It is a section of Chapter 02 and it renders there in full, in both locales. Every other page in this pack carries a plain link to it, and plain links work with scripts off: Chapters 01, 03 and 04 in their urgent-exit line, the landing page in its "Something does not seem right" door, and Funding & Coverage in a line added under its opening notes for this change — that page carried no urgent signpost of its own, so removing the duplicate would otherwise have left a reader there with no route to the list at all.
- **The 9-8-8 crisis line.** The `<noscript>` repeated it on all six pages. It now appears where the content design puts it, and only there: Chapter 01 card 1, as the crisis strip with tap-to-call and tap-to-text, and Chapter 04 card 6, whose own note carries the same sentence word for word beside a link to 988.ca. The landing page, Chapter 02, Chapter 03 and Funding & Coverage do not show it — and did not show it to a reader with JavaScript on before this change either, so what has gone is the second copy a scripts-off reader alone used to get. Whether that line belongs on every page of the microsite is a content decision, and it is open.
- **One French exception, already gated.** On /fr the landing page’s five situation doors — the emergency door among them — wait behind the `doors` review gate, so until that gate opens the French landing page in production carries no link to the red-flag list. See "Written, but not on a page yet".

**Not fixed everywhere.** Outside this microsite, the category listings, the product pages and the cart still deliver their main content inside a streaming boundary, and still show little or nothing with scripts off. None of those pages is in this pack, and they are tracked separately.

What that means for this review. Where these files say a figure is "the same server HTML" or describe what is drawn "before any control is touched", it means the words are in the page rather than built by a script, so nothing can rewrite them and no control is needed to read them — and a reader with JavaScript off now sees them too.

## Files

| File | Page | Words (EN) |
|---|---|---|
| [00-shared.md](en/00-shared.md) · [FR](fr/00-shared.md) | Shared interface text | 1,069 |
| [01-new-to-the-journey.md](en/01-new-to-the-journey.md) · [FR](fr/01-new-to-the-journey.md) | Chapter 01 — New to the Journey | 2,643 |
| [02-get-to-know-your-stoma.md](en/02-get-to-know-your-stoma.md) · [FR](fr/02-get-to-know-your-stoma.md) | Chapter 02 — Your Stoma, and Your Fit | 3,565 |
| [03-everyday-liivving.md](en/03-everyday-liivving.md) · [FR](fr/03-everyday-liivving.md) | Chapter 03 — Everyday Liivving | 3,565 |
| [04-this-might-be-you.md](en/04-this-might-be-you.md) · [FR](fr/04-this-might-be-you.md) | Chapter 04 — This Might Be You | 2,674 |
| [05-funding.md](en/05-funding.md) · [FR](fr/05-funding.md) | Funding & Coverage | 3,297 |
| [06-landing.md](en/06-landing.md) · [FR](fr/06-landing.md) | Landing page | 922 |
| | **Total** | **17,735** |

## What is not in these files

- Product names, descriptions and prices, which come from BigCommerce.
- The site header and navigation, managed separately.
- Kit contents. None of the 8 curated ostomy kits is shown on the landing page, the Liivv Health hub, any chapter, or the Shop Ostomy Care shelf at /liivv-health/ostomy-care/shop-ostomy-care, so no kit is described in these files. Each contradicts the guidance it would sit beside — a starter kit whose barrier and pouch do not couple, a go-bag of moisturising wipes, a pediatric kit carrying convex barrier rings and a lotion — and 5 are held further for their names, three of them also for carrying drugs or natural health products. Two things the site cannot withhold from here, and both are owner steps in BigCommerce: the kits' own product pages stay live, and that shelf's facet counts, total and pagination still count the filtered kits. Removing 8041–8048 from category 1150, or setting is_visible = false, closes both. The rebuild that would make any of these kits safe to list is written as a draft in `core/scripts/create-ostomy-care-kits.mjs` — explicit components per SKU, a locked variant for every component sold in more than one size, and descriptions with no outcome claims — and it is pending owner approval. It has not been run: `OWNER_CONFIRMED` in that file is false, and while it is, the script refuses every request that is not a read. No kit in BigCommerce has been changed.

## Written, but not on a page yet

Both lists below are read out of `chapters-meta.ts` and `review-gates.ts` each time this pack is generated, so neither can fall behind the code.

**Held — built, and rendering on no page, in either locale.** The wording is still in these files, because the ruling that lifts a hold is made on the words as well as on the drawing. Lifting one is a single flag in the source.

- a resources-shelf link on Chapter 01, `shelf.2.1` (Santé Québec – Laurentides) — held until an NSWOC has watched it and confirmed the captions
- the parts of a pouching system on Chapter 02, card 3 — `writtenRuling`: the owner and the NSWOC have to rule in writing that an unbranded schematic is not "product imagery in an explanatory figure", and IP counsel has to check the drawing for trade dress
- the bowel reference still on Chapter 03, card 2 — `ch03Card2Rewrite`: Chapter 03 card 2's second sentence has to be rewritten first, because the figure beside it would otherwise contradict it

**Waiting on French review — on /en now, hidden on /fr until a francophone reviewer signs off the French.** In each case the card or the page keeps the wording a reviewer had already approved, so /fr loses a module rather than a referral, and no gate removes an urgent, emergency or crisis line that the card or the page already carried. The owner opens a gate by adding its id to `FR_REVIEWED` in `review-gates.ts` after the sign-off; a gate with no note beside it is still closed. On local development and on Vercel previews every gate is open so the French can be read in context, each gated module carrying a visible draft marker — production never opens one that way.

- `changeRoutine` — the pouch change walk-through, Chapter 01, card 7
- `supplyList` — my supply list, Chapter 01, card 8; the go-bag link to the supply list, Chapter 01, card 9
- `finder` — the who-to-ask finder, Chapter 01, card 10 — its tick boxes, its link labels and every lane with no sentence of the card's own
- `recoveryMap` — the recovery map, Chapter 01
- `shelf` — the resources shelf, Chapter 01
- `bowelReference` — the bowel reference still, Chapter 02, card 1
- `gapCompare` — the opening gap comparison, Chapter 02, card 9
- `fibreClocks` — the lower-fibre clocks, Chapter 03, card 3
- `childLinks` — the referral band's links, Chapter 04
- `doors` — the landing page's 5 situation doors, the emergency door among them — while this gate is closed /fr shows no doors at all, which takes nothing away because this page carried no emergency signpost before the doors existed

## Regenerating

```bash
node --env-file-if-exists=.env.local core/scripts/export-content-review.mjs
```

Coverage check on this run: **1221 of 1221** English strings under `OstomyCare` appear in these files.
