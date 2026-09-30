/*
 * Which kit and which catalogue products a chapter card may show.
 *
 * Clinical copy stays in chapters-meta.ts. This file is merchandising only:
 * a change to what Liivv stocks must not change what a chapter says.
 * Powder, paste, rings, wipes, convex, and belts are not in any group.
 *
 * A card is one shelf: a hero, a collection, a product rail, a spare of kits,
 * or a one-line reprise of a shelf the reader has already passed. New Image
 * 57 mm and 70 mm are sizes of one system, so they share one photo and one
 * product rail.
 */

export type ShopSystem = 'one' | 'two';

export type ShelfKind = 'hero' | 'collection' | 'products' | 'spare' | 'reprise';

export interface ShopOffer {
  kitIds?: number[];
  productIds: number[];
  /** The supply list shows this offer only after the reader picks that system. */
  system?: ShopSystem;
  /** Key under OstomyCare.ui.chapter.shop.offers. */
  line?: string;
}

export interface CardShelf {
  kind: ShelfKind;
  /** Key under OstomyCare.ui.chapter.shop.occasions. */
  occasion: string;
  offers: ShopOffer[];
}

const ONE_PIECE: ShopOffer = {
  kitIds: [8065],
  productIds: [4891],
  system: 'one',
  line: 'onePiece',
};
const NEW_IMAGE: ShopOffer = {
  kitIds: [8061, 8062],
  productIds: [4541, 4878],
  system: 'two',
  line: 'newImage',
};
const CLICK: ShopOffer = {
  kitIds: [8064],
  productIds: [4583, 4438],
  system: 'two',
  line: 'click',
};

const DRAINABLE: ShopOffer[] = [ONE_PIECE, NEW_IMAGE, CLICK];

const CLOSED: ShopOffer = { kitIds: [8063], productIds: [4541, 4571], line: 'closed' };
const URO_NI: ShopOffer = { kitIds: [8066], productIds: [4541, 4581], line: 'uroImage' };
const URO_CLICK: ShopOffer = { kitIds: [8067], productIds: [4583, 4365], line: 'uroClick' };
const POUCHKINS: ShopOffer = { kitIds: [8068], productIds: [4899, 4968] };
const MEASURE: ShopOffer = { kitIds: [], productIds: [4541, 4583, 4891] };

/** Kits only. A spare and a reprise do not repeat the product photos. */
function kitsOnly(offers: ShopOffer[]): ShopOffer[] {
  return offers.map(({ kitIds, line }) => ({ kitIds: kitIds ?? [], productIds: [], line }));
}

const PLACEMENTS: Record<string, Record<number, CardShelf>> = {
  'new-to-the-journey': {
    6: { kind: 'hero', occasion: 'firstWeek', offers: [ONE_PIECE] },
    7: { kind: 'reprise', occasion: 'sameKit', offers: kitsOnly([ONE_PIECE]) },
    8: { kind: 'collection', occasion: 'yourSystem', offers: DRAINABLE },
    9: { kind: 'spare', occasion: 'spare', offers: kitsOnly(DRAINABLE) },
  },
  'get-to-know-your-stoma': {
    4: { kind: 'collection', occasion: 'systems', offers: DRAINABLE },
    6: { kind: 'collection', occasion: 'output', offers: [CLOSED, URO_NI, URO_CLICK] },
    9: { kind: 'products', occasion: 'measure', offers: [MEASURE] },
    22: { kind: 'spare', occasion: 'travelSpare', offers: kitsOnly(DRAINABLE) },
  },
  'everyday-liivving': {
    // Flying with supplies. The card titled Travel & Workdays is chapter 2.
    10: { kind: 'spare', occasion: 'travelSpare', offers: kitsOnly(DRAINABLE) },
  },
  'this-might-be-you': {
    1: { kind: 'hero', occasion: 'child', offers: [POUCHKINS] },
    2: { kind: 'collection', occasion: 'adultSystems', offers: DRAINABLE },
    3: { kind: 'reprise', occasion: 'sameSystems', offers: kitsOnly(DRAINABLE) },
    4: { kind: 'reprise', occasion: 'sameSystems', offers: kitsOnly(DRAINABLE) },
  },
};

export function shelfForCard(slug: string, card: number): CardShelf | undefined {
  return PLACEMENTS[slug]?.[card];
}

export function shopIdsForChapter(slug: string): number[] {
  const cards = PLACEMENTS[slug];

  if (!cards) return [];

  const ids = new Set<number>();

  Object.values(cards).forEach((shelf) => {
    shelf.offers.forEach((offer) => {
      offer.kitIds?.forEach((id) => ids.add(id));
      offer.productIds.forEach((id) => ids.add(id));
    });
  });

  return [...ids];
}
