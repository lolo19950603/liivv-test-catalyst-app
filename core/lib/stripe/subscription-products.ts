import 'server-only';

import type Stripe from 'stripe';

import type { CheckoutLineItemSnapshot } from '~/lib/checkout/types';

export async function createStripeProductForCheckoutLine(
  stripe: Stripe,
  line: CheckoutLineItemSnapshot,
): Promise<string> {
  const product = await stripe.products.create({
    name: line.name,
    metadata: {
      bigcommerce_product_id: String(line.productEntityId),
      bigcommerce_sku: line.sku ?? '',
    },
  });

  return product.id;
}
