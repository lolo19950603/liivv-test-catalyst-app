import 'server-only';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getCheckoutSnapshot } from '~/lib/checkout/snapshot';
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

async function getSucceededCheckoutSnapshotId(paymentIntentId: string): Promise<string | null> {
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return null;
  }

  return paymentIntent.metadata.checkout_snapshot_id ?? null;
}

export async function clearCheckoutCartAfterStripeSession(paymentIntentId: string): Promise<void> {
  const snapshotId = await getSucceededCheckoutSnapshotId(paymentIntentId);

  if (!snapshotId) {
    return;
  }

  const snapshot = await getCheckoutSnapshot(snapshotId);

  if (!snapshot) {
    return;
  }

  const lineItemEntityIds = [
    ...new Set(snapshot.lineItems.map((line) => line.lineItemEntityId)),
  ];

  try {
    await emptyBigCommerceCart(snapshot.cartId, lineItemEntityIds);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to empty BigCommerce cart after checkout:', error);
  }

  await clearCartId();
}

/** @deprecated Use clearCheckoutCartAfterStripeSession */
export const clearCheckoutCartAfterPayment = clearCheckoutCartAfterStripeSession;
