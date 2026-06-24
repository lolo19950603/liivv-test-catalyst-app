import 'server-only';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { TAGS } from '~/client/tags';
import { graphql } from '~/client/graphql';
import { getCheckoutSnapshot } from '~/lib/checkout/snapshot';
import { clearSubscriptionLinesForCart } from '~/lib/checkout/subscription-lines';
import { getStripe } from '~/lib/stripe/client';

import { clearCartId } from './index';

const DeleteCartLineItemMutation = graphql(`
  mutation ClearCheckoutCartDeleteLineItem($input: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

function isCartNotFoundError(error: unknown): boolean {
  return (
    error instanceof BigCommerceGQLError &&
    error.errors.some((entry) => entry.message.includes('Cart does not exist'))
  );
}

async function emptyBigCommerceCart(cartId: string, lineItemEntityIds: string[]): Promise<void> {
  if (lineItemEntityIds.length === 0) {
    return;
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  for (const lineItemEntityId of lineItemEntityIds) {
    await client.fetch({
      document: DeleteCartLineItemMutation,
      variables: {
        input: {
          cartEntityId: cartId,
          lineItemEntityId,
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
  }
}

async function getSucceededCheckoutSnapshotId(
  stripeSessionId: string,
): Promise<string | null> {
  const stripe = getStripe();

  if (stripeSessionId.startsWith('seti_')) {
    const setupIntent = await stripe.setupIntents.retrieve(stripeSessionId);

    if (setupIntent.status !== 'succeeded') {
      return null;
    }

    return setupIntent.metadata.checkout_snapshot_id ?? null;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(stripeSessionId);

  if (paymentIntent.status !== 'succeeded') {
    return null;
  }

  return paymentIntent.metadata.checkout_snapshot_id ?? null;
}

export async function clearCheckoutCartAfterStripeSession(
  stripeSessionId: string,
  options?: { clearSessionCart?: boolean },
): Promise<void> {
  const snapshotId = await getSucceededCheckoutSnapshotId(stripeSessionId);

  if (!snapshotId) {
    return;
  }

  const snapshot = await getCheckoutSnapshot(snapshotId);

  if (!snapshot) {
    return;
  }

  const lineItemEntityIds = snapshot.lineItems.map((line) => line.lineItemEntityId);

  try {
    await emptyBigCommerceCart(snapshot.cartId, lineItemEntityIds);
  } catch (error) {
    if (!isCartNotFoundError(error)) {
      // eslint-disable-next-line no-console
      console.error('Failed to empty BigCommerce cart after checkout:', error);
    }
  }

  await clearSubscriptionLinesForCart(snapshot.cartId);

  if (options?.clearSessionCart !== false) {
    await clearCartId();
  }

  revalidateTag(TAGS.cart, { expire: 0 });
}

/** @deprecated Use clearCheckoutCartAfterStripeSession */
export const clearCheckoutCartAfterPayment = clearCheckoutCartAfterStripeSession;
