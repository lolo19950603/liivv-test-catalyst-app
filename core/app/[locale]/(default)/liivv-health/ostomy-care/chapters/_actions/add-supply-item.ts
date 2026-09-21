'use server';

import { addToOrCreateCart } from '~/lib/cart';

import { SUPPLY_CART_ALLOWLIST } from '../supply-list-merchandising';

/*
 * =============================================================================
 * SUPPLY LIST — ADD ONE ITEM (C02)
 * =============================================================================
 * The only server call the supply list makes, and the only thing it can do is
 * put one allowlisted product in the cart.
 *
 * What a reader ticks never reaches this action, or any server: the form
 * carries a single product id and nothing else. There is no quantity, no
 * "add all", no redirect, no mini-cart, no toast, no message text and no
 * analytics event — the reader stays where they were, and the list says what
 * happened in its own status line.
 *
 * The allowlist is the guard. An id that is not on it is refused before any
 * BigCommerce call, so a tampered form cannot add an arbitrary product through
 * an ostomy page.
 * =============================================================================
 */

export type SupplyAddState =
  | { status: 'idle' }
  | { status: 'added'; productEntityId: number }
  | { status: 'error' };

export async function addSupplyItemToCart(
  prev: SupplyAddState,
  formData: FormData,
): Promise<SupplyAddState> {
  const raw = formData.get('productEntityId');
  const productEntityId = Number.parseInt(typeof raw === 'string' ? raw : '', 10);

  if (!SUPPLY_CART_ALLOWLIST.has(productEntityId)) {
    return { status: 'error' };
  }

  try {
    await addToOrCreateCart({ lineItems: [{ productEntityId, quantity: 1 }] });

    return { status: 'added', productEntityId };
  } catch {
    /*
     * A cart that has gone away (MissingCartError) and a stock or validation
     * refusal from BigCommerce (BigCommerceGQLError) are the expected
     * failures, and anything else is treated the same way: the list shows its
     * own short line and never repeats a server message to a reader.
     */
    return { status: 'error' };
  }
}
