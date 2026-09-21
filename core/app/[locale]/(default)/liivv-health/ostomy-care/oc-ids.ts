/** Shared Ostomy Care product IDs (safe for client + server). */

/** Featured curated kit — The Fresh Start (New Ostomate Starter Kit). */
export const FRESH_START_KIT_ID = 8041;

/** @deprecated Use FRESH_START_KIT_ID */
export const NEW_JOURNEY_STARTER_KIT_ID = FRESH_START_KIT_ID;

/** Featured pouch for hero float (SenSura 1-Piece Drainable Opaque). */
export const HERO_FLOAT_POUCH_ID = 4441;

/** Featured skin accessory for hero float (Adapt Barrier Rings). */
export const HERO_FLOAT_BARRIER_ID = 4560;

/** Shop Ostomy Care category. */
export const SHOP_OSTOMY_CARE_CATEGORY_ID = 1150;

/*
 * =============================================================================
 * Categories that make a product health-revealing
 * =============================================================================
 *
 * Which shelves say something about a person's body rather than their taste.
 * Ostomy products sit in two separate branches of the catalogue, and a rule
 * written against the shop category alone would miss half of them:
 *
 *   1150  Shop Ostomy Care          (under Liivv Health (Shop))
 *   1035  Ostomy Care               (Liivv Your Life > Heal + Manage)
 *   1064  One-Piece Pouches         (under 1035)
 *   1084  Two-Piece Pouches         (under 1035)
 *   1102  Skin Barriers & Flanges   (under 1035)
 *   1110  Ostomy Accessories        (under 1035)
 *
 * Five products in the 1035 branch are not in 1150 at all, including the
 * adhesive remover wipes a go-bag would hold.
 *
 * 1115 "Wound Cleansers & Skin Prep" is deliberately not here: it is a general
 * wound-care shelf, and the ostomy products in it (#4531) are also in 1150.
 * One product (#4937) sits in 1115 only and is therefore not covered — it is
 * recorded as a known gap rather than fixed by widening the rule to a shelf
 * that says nothing about an ostomy.
 *
 * These six are branch roots, not an inventory. A category page answers for
 * its whole breadcrumb trail (`categoryLineageIds` in
 * core/lib/analytics/sensitive-products.ts), so a shelf added under 1035 or
 * 1150 tomorrow is covered on the day it appears, with nobody editing this
 * list.
 *
 * Where ancestry is not in hand, the list is still read as ids: a cart line,
 * a wishlist or a compare row is answered from the product's own category
 * assignments, and BigCommerce returns the categories a product is *in*, not
 * their parents. A product assigned only to a future sub-shelf of 1035 and to
 * nothing else in this list would therefore not be caught there. Recorded
 * rather than closed: closing it means asking the catalogue for each
 * category's breadcrumbs on every cart render, and today every ostomy product
 * in the catalogue is assigned to 1150 or 1035 itself. Revisit it when a new
 * sub-shelf gets products of its own.
 *
 * Used by core/lib/analytics/sensitive-products.ts. Kept here because it is a
 * list of identifiers, and identifiers live in TS meta.
 */
export const OSTOMY_ANALYTICS_CATEGORY_IDS: readonly number[] = [
  SHOP_OSTOMY_CARE_CATEGORY_ID,
  1035, // Ostomy Care
  1064, // One-Piece Pouches
  1084, // Two-Piece Pouches
  1102, // Skin Barriers & Flanges
  1110, // Ostomy Accessories
];

/* Whether this category is one whose membership reveals something about a body. */
export function isOstomyCategoryId(entityId: number): boolean {
  return OSTOMY_ANALYTICS_CATEGORY_IDS.includes(entityId);
}

/* Whether any of these categories does. */
export function isOstomyCategoryIds(entityIds: readonly number[]): boolean {
  return entityIds.some(isOstomyCategoryId);
}

/*
 * =============================================================================
 * Curated kits on Ostomy Care surfaces
 * =============================================================================
 *
 * Every curated kit in category 1150, and which of them an ostomy surface may
 * show. "Ostomy surfaces" means the Ostomy Care landing, the Liivv Health hub's
 * featured kits and the chapter product bands — everything that reads the
 * catalogue through getOcCatalog — plus the Shop Ostomy Care shelf itself,
 * /liivv-health/ostomy-care/shop-ostomy-care, which is category 1150 rendered
 * by the faceted category route and filters on `isOstomyKit` there.
 *
 * Two things this allowlist still does not reach, and neither is a withhold:
 *
 *   the product page   a kit's own PDP stays reachable, because only the store
 *                      can take a product down.
 *   the counts         facet counts, the total and the pagination on that shelf
 *                      come from BigCommerce and still include the kits, so a
 *                      filtered page can show fewer cards than its count says.
 *
 * Both close the same way, and it is the owner's step: take 8041–8048 out of
 * category 1150, or set is_visible = false on them.
 *
 * OSTOMY_LISTED_KIT_IDS is the allowlist, and it is deliberately empty. Not one
 * of the eight kits can be shown beside ostomy guidance as it stands today, so
 * the honest list is none of them rather than the least-bad three:
 *
 *   8041 The Fresh Start      the barrier and the pouch do not couple. Component
 *                             4541 has no default option value, so the page
 *                             picks 57 mm, while pouch 4691 is sold only in
 *                             70 mm. As sold, the kit does not fit together.
 *   8046 Everyday Living      a go-bag whose wipes are moisturising (gel wipes
 *                             and scented conditioning wipes), which is the
 *                             opposite of what the chapters tell a reader to put
 *                             near a barrier. Also carries a belt.
 *   8048 Newly Diagnosed      carries barrier rings and a belt, neither of which
 *                             belongs in a first kit chosen without an NSWOC.
 *
 * The five in OSTOMY_WITHHELD_KIT_IDS are held for a further reason: their names
 * and contents make claims Liivv cannot stand behind (prevention, rescue and
 * leak-free wording), and three of them carry drugs or natural health products.
 * They stay withheld until they are renamed, the drugs and the pediatric convex
 * rings and lotion come out, and substantiation is on file.
 *
 * When K1 rebuilds a kit, add its id to OSTOMY_LISTED_KIT_IDS. Nothing else has
 * to change: the landing, the hub and the chapter bands all filter on this list.
 *
 * Still open, and not closed by anything in this repo: 8041 is live in the
 * store (is_visible = true) and still sells a 57 mm barrier beside a pouch made
 * only in 70 mm. The kit product page can lock a component to one variant, but
 * it does that by reading the `kit_variants` custom field, and that field is
 * empty on 8041, 8046 and 8048 (read 2026-09-16). The lock is inert until an
 * owner approves KIT_META in core/scripts/create-ostomy-care-kits.mjs, sets
 * OWNER_CONFIRMED = true and runs it. This allowlist does not reach that: it
 * keeps kits off Ostomy Care surfaces, not off their own product pages.
 */

/** Every curated ostomy kit in category 1150, listed or not. */
export const OSTOMY_KIT_IDS: readonly number[] = [
  8041, // The Fresh Start
  8042, // Skin Shield
  8043, // Inner Balance
  8044, // Stay Hydrated
  8045, // Leak-Free Confidence
  8046, // Everyday Living
  8047, // Little Ostomate
  8048, // Newly Diagnosed
];

/** Kits an Ostomy Care surface may show. Empty until K1 rebuilds them. */
export const OSTOMY_LISTED_KIT_IDS: readonly number[] = [];

/** Kits held back for claims and contents, not only for a rebuild. */
export const OSTOMY_WITHHELD_KIT_IDS: readonly number[] = [
  8042, // Skin Shield — "Infection Prevention" in the name; no substantiation on file
  8043, // Inner Balance — probiotics, fibre and antacids; drugs and NHPs, not ostomy supplies
  8044, // Stay Hydrated — "Dehydration Rescue"; contains loperamide
  8045, // Leak-Free Confidence — "Leak-Free" is an outcome claim
  8047, // Little Ostomate — pediatric kit carrying convex barrier rings and a baby lotion
];

/* Whether an Ostomy Care surface may show this curated kit. */
export function isListedOstomyKit(entityId: number): boolean {
  return OSTOMY_LISTED_KIT_IDS.includes(entityId);
}

/* Whether this id is held back from Ostomy Care surfaces altogether. */
export function isWithheldOstomyId(entityId: number): boolean {
  return OSTOMY_WITHHELD_KIT_IDS.includes(entityId);
}

/* Whether this id is one of the curated ostomy kits, listed or not. */
export function isOstomyKit(entityId: number): boolean {
  return OSTOMY_KIT_IDS.includes(entityId);
}
