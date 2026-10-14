'use server';

import { addAllowlistedProduct } from '../../../_microsite/shop/add-placement';
import type { PlacementAddState } from '../../../_microsite/shop/types';
import { SLEEP_PLACED_PRODUCT_IDS } from '../chapter-shop';

/*
 * The one cart action on the Sleep pages: one product, and only one this
 * site's merchandising record places (../chapter-shop.ts). The record places
 * nothing yet, so the allowlist is empty and every request is refused before
 * any cart call. addAllowlistedProduct also refuses every view-only product
 * (~/lib/catalog/view-only.ts): machines and complete masks never go in a
 * cart from a shelf.
 */

const ALLOWLIST: ReadonlySet<number> = new Set(SLEEP_PLACED_PRODUCT_IDS);

export async function addSleepPlacementToCart(
  _prev: PlacementAddState,
  formData: FormData,
): Promise<PlacementAddState> {
  return addAllowlistedProduct(ALLOWLIST, formData);
}
