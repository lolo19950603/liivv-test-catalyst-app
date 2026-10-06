/* Twin of ostomy-care/chapters/_actions/add-supply-item.ts @3b343c6e — port fixes both ways until Phase 2 */

import 'server-only';

import { addToOrCreateCart } from '~/lib/cart';

import type { PlacementAddState } from './types';

/*
 * =============================================================================
 * PRODUCT PLACEMENTS — ADD ONE PRODUCT
 * =============================================================================
 * The body of every site's placement add action. Each site has its own
 * 'use server' action (its chapters/_actions/add-placement.ts) that hands
 * this its own allowlist, the product ids its merchandising record places, so
 * one site's buttons can never add another site's products.
 *
 * The form carries one product id and nothing else. An id that is not on the
 * allowlist is refused before any BigCommerce call, so a tampered form cannot
 * add an arbitrary product through a care page. No quantity, no "add all",
 * no message text and no analytics event: the button says what happened in
 * its own status line.
 * =============================================================================
 */

export async function addAllowlistedProduct(
  allowlist: ReadonlySet<number>,
  formData: FormData,
): Promise<PlacementAddState> {
  const raw = formData.get('productEntityId');
  const productEntityId = Number.parseInt(typeof raw === 'string' ? raw : '', 10);

  if (!allowlist.has(productEntityId)) {
    return { status: 'error' };
  }

  try {
    await addToOrCreateCart({ lineItems: [{ productEntityId, quantity: 1 }] });

    return { status: 'added', productEntityId };
  } catch {
    /*
     * A cart that has gone away, and a stock, option or validation refusal
     * from BigCommerce, are the expected failures; anything else is treated
     * the same way. The button shows its own short line and never repeats a
     * server message to a reader.
     */
    return { status: 'error' };
  }
}
