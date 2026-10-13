'use server';

import { pharmacistProductIds } from '~/lib/checkout/quebec-insulin';

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
 * The record places no insulin and no kit. Anything the catalogue says is
 * insulin or glucagon, or a curated kit holding either (production check,
 * 2026-10-12), is refused too, whatever the record places later.
 */

const ALLOWLIST: ReadonlySet<number> = new Set(
  DIABETES_PLACED_PRODUCT_IDS.filter((id) => !GLUCAGON_PRODUCT_IDS.includes(id)),
);

export async function addDiabetesPlacementToCart(
  _prev: PlacementAddState,
  formData: FormData,
): Promise<PlacementAddState> {
  const raw = formData.get('productEntityId');
  const productEntityId = Number.parseInt(typeof raw === 'string' ? raw : '', 10);

  if (
    ALLOWLIST.has(productEntityId) &&
    (await pharmacistProductIds([productEntityId])).has(productEntityId)
  ) {
    return { status: 'error' };
  }

  return addAllowlistedProduct(ALLOWLIST, formData);
}
