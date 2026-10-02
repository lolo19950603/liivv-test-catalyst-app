/** Shared Ostomy Care product IDs (safe for client + server). */

/** Featured curated kit on the Ostomy Care landing — the starter accessory kit. */
export const STARTER_ACCESSORY_KIT_ID = 8069;

/** Barrier film, protective sheet, paste, and barrier cream. Fits any opening size. */
export const SKIN_COMFORT_KIT_ID = 8038;

/** Odour drops, lubricating deodorant, and a clamp. Fits any opening size. */
export const POUCH_COMFORT_KIT_ID = 8070;

/** @deprecated Use STARTER_ACCESSORY_KIT_ID */
export const FRESH_START_KIT_ID = STARTER_ACCESSORY_KIT_ID;

/** @deprecated Use STARTER_ACCESSORY_KIT_ID */
export const NEW_JOURNEY_STARTER_KIT_ID = STARTER_ACCESSORY_KIT_ID;

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
 * The landing and the chapters place only the ids in OSTOMY_KIT_IDS. The shop
 * shelf and search still list a kit product until it is deleted from the
 * catalogue.
 *
 * The Chapter 1 supply list links the pouch and barrier for the system the
 * reader picked. The starter accessory kit is shown with either system.
 */

/** The accessory kits. Surfaces show this whole list. */
export const OSTOMY_KIT_IDS: readonly number[] = [
  STARTER_ACCESSORY_KIT_ID,
  SKIN_COMFORT_KIT_ID,
  POUCH_COMFORT_KIT_ID,
];

/** Every curated ostomy kit. Surfaces show this whole list. */
export const OSTOMY_LISTED_KIT_IDS: readonly number[] = OSTOMY_KIT_IDS;

/** None. Kept so older checks that read this list still compile. */
export const OSTOMY_WITHHELD_KIT_IDS: readonly number[] = [];

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
