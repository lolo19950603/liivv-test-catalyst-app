/*
 * Which catalogue products a chapter card may show.
 *
 * Clinical copy stays in chapters-meta.ts. This file is merchandising only:
 * a change to what Liivv stocks must not change what a chapter says.
 *
 * A pouch and its barrier are two products. The reader chooses the flange
 * size on the product page. A kit here is extras that fit any opening.
 */

import { SKIN_COMFORT_KIT_ID, STARTER_ACCESSORY_KIT_ID } from '../oc-ids';

export type ShopSystem = 'one' | 'two';

export type ShelfKind = 'hero' | 'collection' | 'products' | 'spare' | 'reprise';

export const SHOP_OCCASIONS = [
  'firstWeek',
  'sameKit',
  'yourSystem',
  'spare',
  'systems',
  'output',
  'measure',
  'travelSpare',
  'child',
  'adultSystems',
  'sameSystems',
  'skinComfort',
  'goBagKit',
] as const;

export type ShopOccasion = (typeof SHOP_OCCASIONS)[number];

export const SHOP_OFFER_LINES = [
  'onePiece',
  'newImage',
  'click',
  'closed',
  'uroImage',
  'uroClick',
  'starterKit',
  'skinComfort',
] as const;

export type ShopOfferLine = (typeof SHOP_OFFER_LINES)[number];

export interface ShopOffer {
  kitIds?: number[];
  productIds: number[];
  /** The supply list shows this offer only after the reader picks that system. */
  system?: ShopSystem;
  /** Key under OstomyCare.ui.chapter.shop.offers. */
  line?: ShopOfferLine;
}

export interface CardShelf {
  kind: ShelfKind;
  /** Key under OstomyCare.ui.chapter.shop.occasions. */
  occasion: ShopOccasion;
  offers: ShopOffer[];
}

const ONE_PIECE: ShopOffer = {
  productIds: [4891],
  system: 'one',
  line: 'onePiece',
};
const NEW_IMAGE: ShopOffer = {
  productIds: [4541, 4878],
  system: 'two',
  line: 'newImage',
};
const CLICK: ShopOffer = {
  productIds: [4583, 4438],
  system: 'two',
  line: 'click',
};

const DRAINABLE: ShopOffer[] = [ONE_PIECE, NEW_IMAGE, CLICK];

const CLOSED: ShopOffer = { productIds: [4541, 4571], line: 'closed' };
const URO_NI: ShopOffer = { productIds: [4541, 4581], line: 'uroImage' };
const URO_CLICK: ShopOffer = { productIds: [4583, 4365], line: 'uroClick' };
const POUCHKINS: ShopOffer = { productIds: [4899, 4968] };
const MEASURE: ShopOffer = { productIds: [4541, 4583, 4891] };
const STARTER_KIT: ShopOffer = {
  kitIds: [STARTER_ACCESSORY_KIT_ID],
  productIds: [],
  line: 'starterKit',
};
const SKIN_KIT: ShopOffer = {
  kitIds: [SKIN_COMFORT_KIT_ID],
  productIds: [],
  line: 'skinComfort',
};

/** A spare and a reprise do not repeat the large product photos. */
function productsOnly(offers: ShopOffer[]): ShopOffer[] {
  return offers.map(({ productIds, line }) => ({ productIds, line }));
}

const PLACEMENTS: Record<string, Record<number, CardShelf>> = {
  'new-to-the-journey': {
    6: { kind: 'hero', occasion: 'firstWeek', offers: [ONE_PIECE] },
    7: { kind: 'reprise', occasion: 'sameKit', offers: productsOnly([ONE_PIECE]) },
    8: { kind: 'collection', occasion: 'yourSystem', offers: [...DRAINABLE, STARTER_KIT] },
    9: { kind: 'hero', occasion: 'goBagKit', offers: [STARTER_KIT] },
  },
  'get-to-know-your-stoma': {
    4: { kind: 'collection', occasion: 'systems', offers: DRAINABLE },
    5: { kind: 'hero', occasion: 'skinComfort', offers: [SKIN_KIT] },
    6: { kind: 'collection', occasion: 'output', offers: [CLOSED, URO_NI, URO_CLICK] },
    9: { kind: 'products', occasion: 'measure', offers: [MEASURE] },
    22: { kind: 'spare', occasion: 'travelSpare', offers: productsOnly(DRAINABLE) },
  },
  'everyday-liivving': {
    10: { kind: 'spare', occasion: 'travelSpare', offers: productsOnly(DRAINABLE) },
  },
  'this-might-be-you': {
    1: { kind: 'hero', occasion: 'child', offers: [POUCHKINS] },
    2: { kind: 'collection', occasion: 'adultSystems', offers: DRAINABLE },
    3: { kind: 'reprise', occasion: 'sameSystems', offers: productsOnly(DRAINABLE) },
    4: { kind: 'reprise', occasion: 'sameSystems', offers: productsOnly(DRAINABLE) },
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
