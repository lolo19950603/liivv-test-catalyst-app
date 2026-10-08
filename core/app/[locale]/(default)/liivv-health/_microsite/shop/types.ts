/*
 * The shapes that cross from the server to a page's shelves: the catalogue's
 * answer for each placed product (./get-placement-items.ts) and the state of
 * one add button (./add-placement.ts). Types only, so the client components
 * can name them without importing anything server-only.
 */

export interface PlacementItem {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  /** Nothing to choose on the product page, so a single click can add it. */
  oneClick: boolean;
  /**
   * Never added from a shelf, whatever `oneClick` says: the card links its
   * product page as "View product" (`ui.commerce.viewProduct`). Diabetes Care
   * sets it for insulin and glucagon (owner note 9, 2026-10-07).
   */
  viewOnly?: boolean;
}

export type PlacementItems = Record<number, PlacementItem>;

export type PlacementAddState =
  | { status: 'idle' }
  | { status: 'added'; productEntityId: number }
  | { status: 'error' };
