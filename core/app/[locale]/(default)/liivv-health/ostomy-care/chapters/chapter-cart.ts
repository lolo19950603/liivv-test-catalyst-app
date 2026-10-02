/*
 * What a chapter card may put in the cart.
 *
 * A pouch and its barrier are two products. One button adds both, and only a
 * pair that shares a flange size: New Image red 57 mm does not couple with
 * blue 70 mm. Variant ids were read from the catalogue on 2026-10-02.
 *
 * The server action accepts a bundle key, never a product id from the form.
 */

export type ChapterCartKind = 'both' | 'one' | 'kit';

export interface ChapterCartLine {
  productEntityId: number;
  variantEntityId: number;
  name: string;
  sku?: string;
}

export interface ChapterCartBundle {
  key: string;
  kind: ChapterCartKind;
  /** Flange size, or the cut range on a one-piece pouch. Printed on the button. */
  size?: string;
  /** The card this single-product button sits under. */
  productEntityId?: number;
  kitName?: string;
  lines: ChapterCartLine[];
}

const BUNDLES = {
  'one-piece': {
    key: 'one-piece',
    kind: 'one',
    size: '10–76 mm',
    productEntityId: 4891,
    lines: [
      {
        productEntityId: 4891,
        variantEntityId: 6225,
        name: 'SenSura 1-Piece Drainable Pouch (Flat) (Transparent)',
        sku: '702524',
      },
    ],
  },
  'ni-drain-57': {
    key: 'ni-drain-57',
    kind: 'both',
    size: '57 mm',
    lines: [
      {
        productEntityId: 4541,
        variantEntityId: 5499,
        name: 'New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)',
        sku: '702133',
      },
      {
        productEntityId: 4878,
        variantEntityId: 6197,
        name: "New Image Two-Piece Drainable Ostomy Pouch (Lock 'n Roll Closure) (Opaque)",
        sku: '702146',
      },
    ],
  },
  'ni-drain-70': {
    key: 'ni-drain-70',
    kind: 'both',
    size: '70 mm',
    lines: [
      {
        productEntityId: 4541,
        variantEntityId: 5500,
        name: 'New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)',
        sku: '702134',
      },
      {
        productEntityId: 4878,
        variantEntityId: 6198,
        name: "New Image Two-Piece Drainable Ostomy Pouch (Lock 'n Roll Closure) (Opaque)",
        sku: '702147',
      },
    ],
  },
  'click-drain': {
    key: 'click-drain',
    kind: 'both',
    size: '50 mm',
    lines: [
      {
        productEntityId: 4583,
        variantEntityId: 5594,
        name: 'SenSura Click Flat Flange',
        sku: '702199',
      },
      {
        productEntityId: 4438,
        variantEntityId: 5280,
        name: 'SenSura Click Two-Piece Drainable Pouch (Wide Outlet) (Filter)',
        sku: '702200',
      },
    ],
  },
  'ni-closed-57': {
    key: 'ni-closed-57',
    kind: 'both',
    size: '57 mm',
    lines: [
      {
        productEntityId: 4541,
        variantEntityId: 5499,
        name: 'New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)',
        sku: '702133',
      },
      {
        productEntityId: 4571,
        variantEntityId: 5567,
        name: 'New Image Two-Piece Closed Pouch',
        sku: '702637',
      },
    ],
  },
  'ni-uro-70': {
    key: 'ni-uro-70',
    kind: 'both',
    size: '70 mm',
    lines: [
      {
        productEntityId: 4541,
        variantEntityId: 5500,
        name: 'New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)',
        sku: '702134',
      },
      {
        productEntityId: 4581,
        variantEntityId: 5590,
        name: 'New Image Two-Piece Urostomy Pouch',
        sku: '702157',
      },
    ],
  },
  'click-uro': {
    key: 'click-uro',
    kind: 'both',
    size: '50 mm',
    lines: [
      {
        productEntityId: 4583,
        variantEntityId: 5594,
        name: 'SenSura Click Flat Flange',
        sku: '702199',
      },
      {
        productEntityId: 4365,
        variantEntityId: 5131,
        name: 'SenSura Click Urostomy Pouch',
        sku: '702263',
      },
    ],
  },
  pouchkins: {
    key: 'pouchkins',
    kind: 'both',
    size: '44 mm',
    lines: [
      {
        productEntityId: 4899,
        variantEntityId: 6242,
        name: 'Pouchkins Pediatric Flat Skin Barrier',
        sku: '702227',
      },
      {
        productEntityId: 4968,
        variantEntityId: 6397,
        name: "Pouchkins Two-Piece Pediatric Ostomy Pouch (Lock 'n Roll Closure)",
        sku: '702229',
      },
    ],
  },
  'ni-barrier-57': {
    key: 'ni-barrier-57',
    kind: 'one',
    size: '57 mm',
    productEntityId: 4541,
    lines: [
      {
        productEntityId: 4541,
        variantEntityId: 5499,
        name: 'New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)',
        sku: '702133',
      },
    ],
  },
  'ni-barrier-70': {
    key: 'ni-barrier-70',
    kind: 'one',
    size: '70 mm',
    productEntityId: 4541,
    lines: [
      {
        productEntityId: 4541,
        variantEntityId: 5500,
        name: 'New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)',
        sku: '702134',
      },
    ],
  },
  'click-flange': {
    key: 'click-flange',
    kind: 'one',
    size: '50 mm',
    productEntityId: 4583,
    lines: [
      {
        productEntityId: 4583,
        variantEntityId: 5594,
        name: 'SenSura Click Flat Flange',
        sku: '702199',
      },
    ],
  },
  'starter-kit': {
    key: 'starter-kit',
    kind: 'kit',
    productEntityId: 8069,
    kitName: 'Starter Accessory Kit',
    lines: [
      {
        productEntityId: 4937,
        variantEntityId: 6323,
        name: 'Remove Adhesive Remover Wipes',
        sku: 'RP-403120',
      },
      {
        productEntityId: 4439,
        variantEntityId: 5282,
        name: 'Convatec AllKare Protective Barrier Wipe',
        sku: 'CON37439',
      },
    ],
  },
  'skin-kit': {
    key: 'skin-kit',
    kind: 'kit',
    productEntityId: 8038,
    kitName: 'Skin Comfort Kit',
    lines: [
      {
        productEntityId: 8014,
        variantEntityId: 10165,
        name: 'SKIN-PREP Protective Barrier Wipe',
        sku: 'SN59420425',
      },
      {
        productEntityId: 4890,
        variantEntityId: 6224,
        name: 'Brava Protective Sheet 4" x 4" (10cm x 10cm) (10/Box)',
        sku: '701514',
      },
    ],
  },
} satisfies Record<string, ChapterCartBundle>;

export const CHAPTER_CART_BUNDLES: Record<string, ChapterCartBundle> = BUNDLES;

/** Product ids, sorted and joined, for a barrier and the pouch that fits it. */
const PAIRS: Record<string, string[]> = {
  '4541,4878': ['ni-drain-57', 'ni-drain-70'],
  '4438,4583': ['click-drain'],
  '4541,4571': ['ni-closed-57'],
  '4541,4581': ['ni-uro-70'],
  '4365,4583': ['click-uro'],
  '4899,4968': ['pouchkins'],
};

const SINGLES: Record<number, string[]> = {
  4891: ['one-piece'],
  4541: ['ni-barrier-57', 'ni-barrier-70'],
  4583: ['click-flange'],
  8069: ['starter-kit'],
  8038: ['skin-kit'],
};

function lookup(keys: string[]): ChapterCartBundle[] {
  return keys.flatMap((key) => {
    const bundle = CHAPTER_CART_BUNDLES[key];

    return bundle ? [bundle] : [];
  });
}

/** Buttons for this set of products. A matched pair is one click for both pieces. */
export function cartBundlesForIds(ids: number[]): ChapterCartBundle[] {
  const unique = [...new Set(ids)].sort((a, b) => a - b);

  if (!unique.length) return [];

  const pair = PAIRS[unique.join(',')];

  if (pair) return lookup(pair);

  if (unique.length === 1) return lookup(SINGLES[unique[0]!] ?? []);

  return unique.flatMap((id) => lookup(SINGLES[id] ?? []));
}

/** Buttons that belong on one product card, when the card is not half of a pair. */
export function cartBundlesForProduct(id: number): ChapterCartBundle[] {
  return lookup(SINGLES[id] ?? []);
}
