'use client';

/*
 * =============================================================================
 * PRODUCT PLACEMENTS — WHAT THE SHELVES ON THIS PAGE CAN SHOW
 * =============================================================================
 * The site's own 'use client' wrapper renders ShopProvider around a page that
 * places products, with:
 *
 *   items    the catalogue's answer for the ids this page's shelves name
 *            (./get-placement-items.ts), read on the server and passed in;
 *   add      the site's own 'use server' add action, which only adds the
 *            products its merchandising record places (./add-placement.ts);
 *   chapter  the chapter slug, on a chapter page, so a card can look up its
 *            own shelf (SiteConfig.shop).
 *
 * A page with no provider places nothing: every shelf component returns null
 * without one. That is how a page whose placements are switched off, or a site
 * with no shop at all, renders exactly as it did.
 * =============================================================================
 */

import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { PlacementAddState, PlacementItems } from './types';

export type PlacementAddAction = (
  prev: PlacementAddState,
  formData: FormData,
) => Promise<PlacementAddState>;

interface ShopContextValue {
  items: PlacementItems;
  add: PlacementAddAction;
  chapter?: string;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({
  items,
  add,
  chapter,
  children,
}: {
  items: PlacementItems;
  add: PlacementAddAction;
  chapter?: string;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ items, add, chapter }), [items, add, chapter]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

/* The page's shelves, or null where the page places nothing. */
export function useShop() {
  return useContext(ShopContext);
}
