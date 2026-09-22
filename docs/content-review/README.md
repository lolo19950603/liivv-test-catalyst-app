# Ostomy microsite — content review
**Prepared for:** Liivv management and clinical review  
**Covers:** every page of `/liivv-health/ostomy-care`, in English and French  
**Generated:** 2026-09-22 from commit `fdb10fe4`

> **These files are generated from the site's own sources.** Do not edit them. Mark corrections against the reference beside each line — the change is made in the source, and the files are generated again. That way the text you approve is the text that ships, and the two cannot drift apart.

## How to review

1. Start with the English files. The French is machine translated with partial human correction and needs a separate francophone clinical review.
   In the French files, lines marked ⚑ show on /fr now with no review gate in front of them — French rewritten to follow a correction to the English or to match the glossary beside a new module, and the emergency signposts, which no gate may hide. Review those first; everything else new on /fr waits behind one of the gates listed below.
2. For each correction, give the file and the reference — for example *02, card 18, `18.s1.2`* — and the corrected wording.
3. Check the **Referral chip** and **Products shown** lines under each card as well as the text. A product beside a card is a claim too.
4. Funding figures change. Check each against its official source and note the date you checked.

## These pages render without JavaScript

**This was a ship blocker on the last pack, and most of it is fixed.** With JavaScript disabled or blocked, a reader now gets the page: the heading and hero, the focus and vibe notes, the lede of every card, the figures and their captions, the walk-through steps, Chapter 02’s emergency red-flag list with all of its signs, and the 9-8-8 crisis line on the two chapters that carry it.

**What a reader with scripts off still does not get is the rest of each card.** On the chapter pages, a card longer than its lede keeps the remainder in a collapsed region that only a script opens, so the “3 more” button under it is in the HTML and does nothing. This is not the removed loading gate coming back — it is the cards’ own disclosure, and it was in the last pack too, uncounted. It is the remaining no-JavaScript work on these pages, and this pack does not close it.

What changed: one file, `core/app/[locale]/(default)/loading.tsx`, wrapped every route in this part of the store in a Suspense boundary, so the body of each page arrived in the HTML inside a `<div hidden>` that only an inline script moved into view. That file has been removed, and the page body is in the HTML now.

Measured on the served HTML, with scripts and styles stripped, each page divides into three: what a scripts-off reader sees, what is held inside a collapsed card, and the site header and footer, which this pack does not cover (see "What is not in these files"). The header and footer are the only thing still inside a streaming container, and they are the same block of words on every page — between 3.9% and 15.0% of a page in this pack, a larger share of a short page than of a long chapter. The collapsed cards are the number the last pack did not give, and it is not small:

| Page | In collapsed cards (EN) | In collapsed cards (FR) | Cards collapsed, EN / FR |
|---|---|---|---|
| 01 New to the journey | 1.8% | 6.9% | 6 of 11 / 9 of 11 |
| 02 Get to know your stoma | 32.2% | 36.0% | 17 of 26 / 18 of 26 |
| 03 Everyday Liivving | 21.6% | 23.2% | 10 of 18 / 11 of 18 |
| 04 This might be you | 19.8% | 20.3% | 2 of 6 / 2 of 6 |
| Landing page, Funding & Coverage | 0% | 0% | no cards |

What is locked that way is ordinary chapter content: on Chapter 02 the whole "Your equipment / Your body / Your people" glossary — appliance, barrier, convexity, peristomal skin, mucocutaneous junction, NSWOC — and on Chapter 03 the sub-sections of the change routine, plus the closing note on any card that has one.

**Two things are true of that text, and both were checked on every chapter in both languages.** None of it is emergency, crisis or same-day wording: a card carrying an urgent line is pinned open and has no toggle at all, and a search of every collapsed region for "9-8-8", "9-1-1", "emergency", "urgence", "crise" and "suicide" returns nothing on any chapter in either locale, with the review gates open and with them shut. And with JavaScript on, the browser’s own find-in-page now reaches it: the collapsed regions are hidden with `hidden="until-found"`, so a reader searching a chapter for "convexity" or "mucocutaneous junction" is taken to the words and the card opens around them. Until this pack they were hidden the plain way and find-in-page could not see them at all.

**The French figures above are production figures, and the last pack’s were not.** A development server counts every French review gate as open, so the francophone reviewer can read the drafts in context; production opens none of them, because `FR_REVIEWED` is empty. On /fr each gated module therefore falls back to the plain, already-reviewed list its card had before, and the page is a different shape from the one a dev server serves. These numbers were measured with the gates forced shut, which is what production will serve: on Chapter 01 that is 6.9% rather than the 2.0% a dev server shows, and on Chapter 02 36.0% rather than 32.7%. The English pages read the same either way, since no gate touches them.

**The second copy of the emergency wording is gone, and what each page carries instead is not the same on every page.** Chapter 02’s emergency red-flag list and the 9-8-8 crisis sentence used to be rendered a second time inside a `<noscript>` on every `/liivv-health/ostomy-care/**` page, because while the rest of the page stayed hidden those were the two things a reader could not afford to lose. The pages render their own content now, so that duplicate has been removed rather than left to show twice, and the one sentence it owned — "This page needs JavaScript to show its content…" — is gone from the site and from these files. What that leaves, page by page:

- **The red-flag list.** It is a section of Chapter 02 and it renders there in full, in both locales. Every other page in this pack carries a plain link to it, and plain links work with scripts off: Chapters 01, 03 and 04 in their urgent-exit line, the landing page in its "Something does not seem right" door, and Funding & Coverage in a line added under its opening notes for this change — that page carried no urgent signpost of its own, so removing the duplicate would otherwise have left a reader there with no route to the list at all.
- **The 9-8-8 crisis line.** The `<noscript>` repeated it on all six pages. It now appears where the content design puts it, and only there: Chapter 01 card 1, as the crisis strip with tap-to-call and tap-to-text, and Chapter 04 card 6, whose own note carries the same sentence word for word beside a link to 988.ca. The landing page, Chapter 02, Chapter 03 and Funding & Coverage do not show it — and did not show it to a reader with JavaScript on before this change either, so what has gone is the second copy a scripts-off reader alone used to get. Whether that line belongs on every page of the microsite is a content decision, and it is open.
- **The French landing page.** On /fr the landing’s five situation doors — the emergency door among them — wait behind the `doors` review gate. The page does not go without a route while they do: with that gate shut it prints one urgent signpost in their place, in French, in the same reviewed wording Chapters 01 and 04 and Funding & Coverage carry, and the signpost disappears by itself when the gate opens and the doors come back. Opening `doors` is still the fix; this is so /fr is never the one entry page of the microsite with no way to the red-flag list. See "Written, but not on a page yet".
- **The two Shop Ostomy Care shelves.** `/liivv-health/ostomy-care/shop-ostomy-care` is a BigCommerce category listing rather than a page in this pack, and with scripts off it shows almost nothing — its title, the filter and search labels, and no products. It matched the same `/liivv-health/ostomy-care/**` test the removed `<noscript>` used, so it carried the emergency wording too, and removing the duplicate would otherwise have left it the only ostomy URL with no route to the red-flag list in either direction. It now carries a plain link to that list above the grid, server-rendered, in both locales.

**Not fixed everywhere.** Outside this microsite, the category listings, the product pages and the cart still deliver their main content inside a streaming boundary, and still show little or nothing with scripts off — a product page holds roughly 41,000 characters inside those containers, and the cart shows two words. None of those pages is in this pack and they are tracked separately; `core/app/[locale]/(default)/cart/loading.tsx` is the surviving instance of the route-level pattern this change removed one level up.

What that means for this review. Where these files say a figure is "the same server HTML" or describe what is drawn "before any control is touched", it means the words are in the page rather than built by a script, so nothing can rewrite them and no control is needed to read them — and a reader with JavaScript off sees them too, unless they sit in the collapsed part of a card, which the table above counts.

## Files

| File | Page | Words (EN) |
|---|---|---|
| [00-shared.md](en/00-shared.md) · [FR](fr/00-shared.md) | Shared interface text | 1,069 |
| [01-new-to-the-journey.md](en/01-new-to-the-journey.md) · [FR](fr/01-new-to-the-journey.md) | Chapter 01 — New to the Journey | 2,643 |
| [02-get-to-know-your-stoma.md](en/02-get-to-know-your-stoma.md) · [FR](fr/02-get-to-know-your-stoma.md) | Chapter 02 — Your Stoma, and Your Fit | 3,565 |
| [03-everyday-liivving.md](en/03-everyday-liivving.md) · [FR](fr/03-everyday-liivving.md) | Chapter 03 — Everyday Liivving | 3,565 |
| [04-this-might-be-you.md](en/04-this-might-be-you.md) · [FR](fr/04-this-might-be-you.md) | Chapter 04 — This Might Be You | 2,674 |
| [05-funding.md](en/05-funding.md) · [FR](fr/05-funding.md) | Funding & Coverage | 3,297 |
| [06-landing.md](en/06-landing.md) · [FR](fr/06-landing.md) | Landing page | 954 |
| | **Total** | **17,767** |

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

Coverage check on this run: **1226 of 1226** English strings under `OstomyCare` appear in these files.
