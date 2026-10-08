'use server';

import { addAllowlistedProduct } from '../../../_microsite/shop/add-placement';
import type { PlacementAddState } from '../../../_microsite/shop/types';
import { GLUCAGON_PRODUCT_IDS } from '../../dc-ids';
import { DIABETES_PLACED_PRODUCT_IDS } from '../chapter-shop';

/*
 * The one cart action on the Diabetes pages: one product, and only one this
 * site's merchandising record places (../chapter-shop.ts). An id that is not
 * on that list is refused before any cart call. See
 * ../../../_microsite/shop/add-placement.ts.
 *
 * Glucagon is placed (Staying Safe card 3) but never added from a shelf: its
 * card links the product page (owner note 9), and this refuses it as well.
 * The record places no insulin.
 */

const ALLOWLIST: ReadonlySet<number> = new Set(
  DIABETES_PLACED_PRODUCT_IDS.filter((id) => !GLUCAGON_PRODUCT_IDS.includes(id)),
);

export async function addDiabetesPlacementToCart(
  _prev: PlacementAddState,
  formData: FormData,
): Promise<PlacementAddState> {
  return addAllowlistedProduct(ALLOWLIST, formData);
}
