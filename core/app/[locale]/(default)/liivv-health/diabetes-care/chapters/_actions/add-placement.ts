'use server';

import { addAllowlistedProduct } from '../../../_microsite/shop/add-placement';
import type { PlacementAddState } from '../../../_microsite/shop/types';
import { DIABETES_PLACED_PRODUCT_IDS } from '../chapter-shop';

/*
 * The one cart action on the Diabetes pages: one product, and only one this
 * site's merchandising record places (../chapter-shop.ts). An id that is not
 * on that list is refused before any cart call. See
 * ../../../_microsite/shop/add-placement.ts.
 */

const ALLOWLIST: ReadonlySet<number> = new Set(DIABETES_PLACED_PRODUCT_IDS);

export async function addDiabetesPlacementToCart(
  _prev: PlacementAddState,
  formData: FormData,
): Promise<PlacementAddState> {
  return addAllowlistedProduct(ALLOWLIST, formData);
}
