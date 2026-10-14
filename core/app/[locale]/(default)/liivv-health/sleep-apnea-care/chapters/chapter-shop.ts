/* Twin of ../../diabetes-care/chapters/chapter-shop.ts — the same helpers, Sleep's record */

/*
 * =============================================================================
 * SLEEP APNEA CARE — WHICH CATALOGUE PRODUCTS A PAGE MAY SHOW
 * =============================================================================
 * The merchandising record. Clinical copy stays in chapters-meta.ts and the
 * message tree: a change to what Liivv stocks must not change what a chapter
 * says. The shapes are the engine's (../../_microsite/shop/shelves.ts); the
 * words are `SleepApneaCare.ui.chapter.shop.occasions`.
 *
 * Placements are OFF: the content files approve no product id yet, so no card
 * and no path places anything (SHOP_SWITCH). The rules for when they are
 * approved:
 *   - never on Is It Sleep Apnea?, Driving & Staying Safe or Treatment
 *     Options (machines are not sold; testing and safety cards never sell);
 *   - never on Starting CPAP cards 2, 7, 8 or 9, Everyday "Liivving" cards
 *     2, 5, 6, 8, 9 or 10, or This Might Be You (the child cards are urgent);
 *   - allowed later: Starting CPAP cards 3 (masks), 4 (fit parts),
 *     5 (humidifier parts) and 6 (starter list); Everyday "Liivving" card 1
 *     (cleaning, never ozone or UV), 3 and 4 (resupply), 7 (travel
 *     accessories);
 *   - complete masks carry the notices ['rxMaskCheck', 'rxMaskParts'] and
 *     link their product page, never a one-click add (C26); paediatric masks
 *     never; machines never (N1).
 *
 * Erasable TypeScript and no value imports: ./site.ts carries SLEEP_SHOP, and
 * the content-review export loads that file under Node's type stripping.
 * Every placed id is health-revealing by id for analytics
 * (SLEEP_PLACED_PRODUCT_IDS; core/lib/analytics/sensitive-products.ts).
 * =============================================================================
 */

import type { CardShelf, SiteShop } from '../../_microsite/shop/shelves';

import type { ChapterSlug } from './chapters-meta';
import type { PathSlug } from './paths-meta';

/* The one switch for every product placement on the Sleep pages (owner: no product ids approved). */
export const SHOP_SWITCH: Readonly<{ placements: boolean }> = { placements: false };

export const PLACEMENTS_ON = SHOP_SWITCH.placements;

/*
 * A product description that names, links or phones another retailer is
 * never linked from a Sleep page until it is fixed in the store.
 */
export const SLEEP_REFUSED_DESCRIPTION =
  /cpap[\s_-]*outlet|diabetes[\s_-]*express|866\D{0,3}418\D{0,3}3392/i;

/* The description as a reader would see it, entities and encodings decoded, then tested. */
export function namesAnotherRetailer(description: string | null | undefined): boolean {
  if (!description) return false;

  const words = description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/%([0-9a-f]{2})/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));

  return SLEEP_REFUSED_DESCRIPTION.test(description) || SLEEP_REFUSED_DESCRIPTION.test(words);
}

/* Card shelves by chapter and card number. Empty: no product id is approved. */
const PLACEMENTS: Partial<Record<ChapterSlug, Record<number, CardShelf>>> = {};

/*
 * Path strips. Empty while placements are off. When product ids are approved:
 *   cpap, bilevel → masksAndSupplies (masks, cushions and pillows, headgear,
 *                   tubing, filters, water chambers, cleaning supplies; never
 *                   ozone or UV); complete masks carry ['rxMaskCheck',
 *                   'rxMaskParts'] and link their product page (C26);
 *   travel-cpap   → forTheRoad (travel bags, DC cords and accessories once
 *                   stocked; no battery or power item not checked against MDALL);
 *   oral-appliance, children, not-diagnosed-yet → none, ever.
 * Never on any path: a machine or machine link (N1), ASV, discontinued items,
 * paediatric masks (C17).
 */
export const PATH_SHELVES: Partial<Record<PathSlug, CardShelf>> = {};

export function shelfForCard(slug: string, card: number): CardShelf | undefined {
  if (!PLACEMENTS_ON) return undefined;

  const cards: Record<number, CardShelf> | undefined = Object.entries(PLACEMENTS).find(
    ([key]) => key === slug,
  )?.[1];

  return cards?.[card];
}

export function pathShelf(slug: string): CardShelf | undefined {
  if (!PLACEMENTS_ON) return undefined;

  return Object.entries(PATH_SHELVES).find(([key]) => key === slug)?.[1];
}

export function shopIdsForChapter(slug: string): number[] {
  if (!PLACEMENTS_ON) return [];

  const cards = Object.entries(PLACEMENTS).find(([key]) => key === slug)?.[1];

  return [
    ...new Set(
      Object.values(cards ?? {}).flatMap((shelf) =>
        shelf.offers.flatMap((offer) => offer.productIds),
      ),
    ),
  ];
}

/*
 * =============================================================================
 * THE SHOP RULES, AS A CHECK (the plan's Part B shop rules; 04 and 05 A.2)
 * =============================================================================
 * Where a strip may ever stand, whatever the record above says once product
 * ids are approved. `shelfRuleProblems` lists every way a record breaks them;
 * the content-review export and ./chapter-shop.test.ts run it on the real
 * record, so a placement that breaks a rule fails before it ships:
 *   - only on the cards and paths below: never on a testing, red-flag or
 *     driving card (Chapters 01, 02 and 03 have none at all), never on an
 *     urgent card, never on a reading-only path;
 *   - never a machine or a bundle holding one (N1), on any card or path;
 *   - a paediatric mask only on a paediatric card (C17), and there is none
 *     yet: every child card in Chapter 06 is urgent, and Everyday "Liivving"
 *     card 5 has no strip (05 R5);
 *   - complete masks are never one-click: ./placement-items.ts makes them
 *     "View product", where the prescription check is (C26), and a shelf
 *     that holds one carries the notices ['rxMaskCheck', 'rxMaskParts'].
 * The catalogue facts (which id is a machine, a complete mask, a child's
 * mask) are passed in, as this file may import no value.
 * =============================================================================
 */

/* The only cards a strip may stand on. */
export const SHELF_CARDS: Readonly<Partial<Record<ChapterSlug, readonly number[]>>> = {
  'starting-cpap': [3, 4, 5, 6],
  'everyday-liivving': [1, 3, 4, 7],
};

/* The only paths with a strip. oral-appliance, children and not-diagnosed-yet: none, ever. */
export const SHELF_PATHS: readonly PathSlug[] = ['cpap', 'bilevel', 'travel-cpap'];

/* Cards for a child, the only place a paediatric mask may stand. None yet (see above). */
export const PAEDIATRIC_SHELF_CARDS: Readonly<Partial<Record<ChapterSlug, readonly number[]>>> = {};

export interface ShelfFacts {
  isMachine: (entityId: number) => boolean;
  isPaediatricMask: (entityId: number) => boolean;
  isCompleteMask: (entityId: number) => boolean;
  /* The card carries a same-day, emergency or red-flag line (CategoryMeta `urgentContent`). */
  isUrgentCard: (chapter: string, card: number) => boolean;
}

function shelfProblems(where: string, shelf: CardShelf, facts: ShelfFacts, paediatricOk: boolean) {
  const ids = shelf.offers.flatMap((offer) => offer.productIds);
  const notices = shelf.notices ?? [];

  return [
    ...ids.filter(facts.isMachine).map((id) => `${where} places machine ${id} (N1)`),
    ...(paediatricOk
      ? []
      : ids.filter(facts.isPaediatricMask).map((id) => `${where} places child's mask ${id} (C17)`)),
    ...(ids.some(facts.isCompleteMask) &&
    !(notices.includes('rxMaskCheck') && notices.includes('rxMaskParts'))
      ? [`${where} holds a complete mask without the rxMaskCheck and rxMaskParts notices (C26)`]
      : []),
  ];
}

export function shelfRuleProblems(
  facts: ShelfFacts,
  record: {
    placements?: Partial<Record<string, Record<number, CardShelf>>>;
    paths?: Partial<Record<string, CardShelf>>;
  } = { placements: PLACEMENTS, paths: PATH_SHELVES },
): string[] {
  const cards = Object.entries(record.placements ?? {}).flatMap(([chapter, shelves]) =>
    Object.entries(shelves ?? {}).map(([card, shelf]) => ({ chapter, card: Number(card), shelf })),
  );
  const allowed = (
    table: Partial<Record<string, readonly number[]>>,
    chapter: string,
    card: number,
  ) => Object.entries(table).some(([slug, numbers]) => slug === chapter && numbers?.includes(card));

  return [
    ...cards.flatMap(({ chapter, card, shelf }) => {
      const where = `shop: ${chapter} card ${card}`;

      return [
        ...(allowed(SHELF_CARDS, chapter, card) ? [] : [`${where} may not carry a strip`]),
        ...(facts.isUrgentCard(chapter, card) ? [`${where} is an urgent card`] : []),
        ...shelfProblems(where, shelf, facts, allowed(PAEDIATRIC_SHELF_CARDS, chapter, card)),
      ];
    }),
    ...Object.entries(record.paths ?? {}).flatMap(([path, shelf]) => {
      const where = `shop: path ${path}`;

      return [
        ...(SHELF_PATHS.some((slug) => slug === path) ? [] : [`${where} may not carry a strip`]),
        ...(shelf ? shelfProblems(where, shelf, facts, false) : []),
      ];
    }),
  ];
}

/* Every product id the record places anywhere, once each. Empty today. */
export const SLEEP_PLACED_PRODUCT_IDS: readonly number[] = [
  ...new Set(
    [
      ...Object.values(PLACEMENTS).flatMap((cards) => Object.values(cards)),
      ...Object.values(PATH_SHELVES),
    ].flatMap((shelf) => shelf.offers.flatMap((offer) => offer.productIds)),
  ),
];

/* Whether this product is placed somewhere on the Sleep pages. */
export function isSleepPlacedProduct(entityId: number): boolean {
  return SLEEP_PLACED_PRODUCT_IDS.includes(entityId);
}

export const SLEEP_SHOP: SiteShop = { on: PLACEMENTS_ON, shelfForCard };
