/* Twin of ostomy-care/chapters/chapter-shop.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * CARE MICROSITES — WHICH PRODUCTS A PAGE MAY SHOW
 * =============================================================================
 * The shapes a site's merchandising record is written in, and the plain
 * helpers that read it. Ostomy's chapter-shop.ts, with its ostomy vocabulary
 * taken out: what a shelf is called, what each offer line says and which
 * products it holds are the site's own (its chapters/chapter-shop.ts), and
 * the words are in `<ns>.ui.chapter.shop`.
 *
 * Clinical copy stays in the site's chapters-meta.ts. A site's record is
 * merchandising only: a change to what Liivv stocks must not change what a
 * chapter says.
 *
 * A record names product ids and nothing else. Whether a product is shown is
 * decided on every request by the catalogue (./get-placement-items.ts): a
 * product that is hidden in the store, cannot be bought or is out of stock is
 * left out, and a shelf with nothing left renders nothing.
 *
 * Erasable TypeScript and no value imports: a site's chapters/site.ts carries
 * its record (SiteConfig.shop), and the content-review export loads that file
 * under Node's type stripping.
 * =============================================================================
 */

export type ShopLinkLang = 'en' | 'fr';

/*
 * One offer: a few products shown together, with an optional line above them
 * (a key under `ui.chapter.shop.offers`), such as the meter brand they match.
 */
export interface ShopOffer {
  productIds: number[];
  line?: string;
}

/*
 * A link to a whole shop category instead of named products, where the
 * choice belongs to the reader's prescriber. `label` is a key under
 * `ui.chapter.shop.offers`. `locales` is the page languages that show it;
 * leave it out for every language. `notices` are keys under `ui.commerce`
 * printed under the shelf only when the link shows, so a page language that
 * does not show the link does not print them either.
 */
export type ShopNotice = 'pharmacistNotice' | 'insulinColdChain' | 'quebecInsulin';

export interface ShopCollectionLink {
  href: string;
  label: string;
  locales?: ShopLinkLang[];
  notices?: ShopNotice[];
}

export interface CardShelf {
  /** Key under `ui.chapter.shop.occasions`: the line that heads the shelf. */
  occasion: string;
  offers: ShopOffer[];
  collection?: ShopCollectionLink;
  /*
   * Keys under `ui.commerce` printed under the shelf whenever it shows, such
   * as `pharmacistNotice`, the words every insulin and glucagon product page
   * carries under its buy box.
   */
  notices?: ShopNotice[];
}

/*
 * What a site's merchandising record gives the engine (SiteConfig.shop).
 * `on` is the one switch: false and no page of the site places a product,
 * whatever the record says. Declared as methods so a site's own functions,
 * typed over its own slugs, still fit.
 */
export interface SiteShop {
  on: boolean;
  shelfForCard(slug: string, card: number): CardShelf | undefined;
}

/* Every product id a shelf names, in order, once each. */
export function shelfProductIds(shelf: CardShelf): number[] {
  return [...new Set(shelf.offers.flatMap((offer) => offer.productIds))];
}

/* Every product id a set of shelves names, once each. */
export function shelvesProductIds(shelves: readonly CardShelf[]): number[] {
  return [...new Set(shelves.flatMap(shelfProductIds))];
}
