/*
 * =============================================================================
 * SUPPLY LIST — MERCHANDISING RECORD (C02)
 * =============================================================================
 * Liivv's own commercial record, signed by Liivv: which Liivv category — if
 * any — answers each of the brand-free criteria the supply list is split into,
 * which products the list may add to a cart, and which kits it may link to.
 *
 * An NSWOC approves the split of the list and what each criterion means in
 * generic terms, and nothing in this file. Mapping a product or a category to
 * a criterion is a merchandising judgement, so it is kept apart from the
 * clinical structure and the two are never confused for each other.
 *
 * The dependency runs one way: `CriterionKey` lives in chapters-meta.ts and
 * this file imports it. chapters-meta.ts must never import this file, or a
 * change to what Liivv stocks could change what the list says.
 *
 *   SUPPLY_COLLECTIONS   No criterion category exists in the catalogue yet, so
 *                        no "Liivv sells some options for this" link renders
 *                        anywhere. A criterion earns an entry only once a real
 *                        category holds stock from at least two manufacturers
 *                        and excludes drugs, natural health products, creams,
 *                        irrigation sets and convex products. `frenchContent`
 *                        has to be true before /fr links to it.
 *
 *   SUPPLY_CART_PRODUCTS Nothing is allowlisted, so the optional shop section
 *                        can add nothing. The list only ever offers one-click
 *                        add for a product with no options to choose and stock
 *                        on hand; no disposal bags are stocked today.
 *
 *   SUPPLY_KIT_LINKS     The SenSura one-piece kit, and the three drainable
 *                        two-piece kits (New Image 57 mm, New Image 70 mm,
 *                        SenSura Click 50 mm). A kit shows only after the
 *                        reader picks that system. Urostomy, closed, and
 *                        Pouchkins stay on the shop shelf.
 * =============================================================================
 */

import type { CriterionKey } from './chapters-meta';

export interface SupplyCollection {
  /** A Liivv category page. Never a search URL, and never a single product. */
  href: string;
  /** The destination has French commercial content; required before /fr links to it. */
  frenchContent: boolean;
  /** At least two, so the link cannot read as one manufacturer's shelf. */
  manufacturers: string[];
}

export const SUPPLY_COLLECTIONS: Record<CriterionKey, SupplyCollection | null> = {
  pouchOne: null,
  pouchTwo: null,
  disposalBags: null,
  skinProtectant: null,
  dryWipes: null,
  adhesiveRemover: null,
  underwearLiner: null,
};

/** Products the list may offer as a one-click add, by criterion. */
export const SUPPLY_CART_PRODUCTS: Partial<Record<CriterionKey, number[]>> = {};

export interface SupplyKitLink {
  system: 'one' | 'two';
  /** Message key under ui.chapter.supplyList.kits. */
  label: 'one' | 'twoNi57' | 'twoNi70' | 'twoClick';
  productId: number;
  path: string;
}

export const SUPPLY_KIT_LINKS: SupplyKitLink[] = [
  {
    system: 'one',
    label: 'one',
    productId: 8065,
    path: '/sensura-one-piece-drainable-kit-flat-transparent/',
  },
  {
    system: 'two',
    label: 'twoNi57',
    productId: 8061,
    path: '/new-image-two-piece-drainable-kit-flat-57-mm-red/',
  },
  {
    system: 'two',
    label: 'twoNi70',
    productId: 8062,
    path: '/new-image-two-piece-drainable-kit-flat-70-mm-blue/',
  },
  {
    system: 'two',
    label: 'twoClick',
    productId: 8064,
    path: '/sensura-click-two-piece-drainable-kit-flat-50-mm/',
  },
];

/*
 * The only product ids the supply list's server action will ever add. Derived
 * from the record above rather than written twice, so an id can never be
 * addable without being listed as merchandising for a criterion.
 */
export const SUPPLY_CART_ALLOWLIST: ReadonlySet<number> = new Set(
  Object.values(SUPPLY_CART_PRODUCTS).flat(),
);
