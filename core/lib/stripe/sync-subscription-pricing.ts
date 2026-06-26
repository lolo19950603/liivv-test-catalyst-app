import 'server-only';

import type Stripe from 'stripe';

import { getStripe, isStripeConfigured } from './client';
import { DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY } from './prepare-subscription-invoice';
import {
  parseSubscriptionBillingContext,
  resolveSubscriptionBillingQuote,
} from './subscription-billing-quote';

export type SyncSubscriptionPricingResult =
  | 'updated'
  | 'paused_out_of_stock'
  | 'unchanged'
  | 'skipped';

function getSubscriptionItemProductId(item: Stripe.SubscriptionItem): string {
  const product = item.price.product;

  if (typeof product === 'string') {
    return product;
  }

  if (!product || product.deleted) {
    throw new Error('Subscription item is missing a Stripe product');
  }

  return product.id;
}

function isDynamicSubscription(subscription: Stripe.Subscription): boolean {
  return subscription.metadata[DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY] === 'true';
}

function hasPricingChanged({
  subscription,
  item,
  quote,
}: {
  subscription: Stripe.Subscription;
  item: Stripe.SubscriptionItem;
  quote: {
    unitAmountExTaxPerUnit: number;
    taxAmount: number;
    unitAmountExTax: number;
    unitAmountIncTax: number;
  };
}): boolean {
  const currentUnitAmount = item.price.unit_amount ?? 0;
  const currentTax = Number(subscription.metadata.billed_tax_cents ?? '0');
  const currentSubtotal = Number(subscription.metadata.billed_subtotal_cents ?? '0');
  const currentTotal = Number(subscription.metadata.billed_total_cents ?? '0');

  return (
    currentUnitAmount !== quote.unitAmountExTaxPerUnit ||
    currentTax !== quote.taxAmount ||
    currentSubtotal !== quote.unitAmountExTax ||
    currentTotal !== quote.unitAmountIncTax
  );
}

export async function syncSubscriptionPricingFromBigCommerce(
  subscription: Stripe.Subscription,
): Promise<SyncSubscriptionPricingResult> {
  if (!isDynamicSubscription(subscription)) {
    return 'skipped';
  }

  const billingContext = parseSubscriptionBillingContext(subscription.metadata);

  if (!billingContext) {
    return 'skipped';
  }

  const item = subscription.items.data[0];

  if (!item?.price.recurring) {
    return 'skipped';
  }

  const quote = await resolveSubscriptionBillingQuote({
    customerId: billingContext.customerId,
    productEntityId: billingContext.productEntityId,
    productOptions: billingContext.productOptions,
    quantity: billingContext.quantity,
  });

  if (!quote) {
    return 'skipped';
  }

  const stripe = getStripe();

  if (!quote.inStock || quote.unitAmountExTaxPerUnit <= 0) {
    if (subscription.pause_collection?.behavior !== 'void') {
      await stripe.subscriptions.update(subscription.id, {
        pause_collection: { behavior: 'void' },
        metadata: {
          ...subscription.metadata,
          subscription_paused_reason: 'out_of_stock',
        },
      });
    }

    return 'paused_out_of_stock';
  }

  const pricingChanged = hasPricingChanged({ subscription, item, quote });
  const wasPausedForStock = subscription.metadata.subscription_paused_reason === 'out_of_stock';

  if (!pricingChanged && !wasPausedForStock && subscription.pause_collection == null) {
    return 'unchanged';
  }

  if (pricingChanged) {
    await stripe.subscriptionItems.update(item.id, {
      price_data: {
        currency: quote.currency.toLowerCase(),
        unit_amount: quote.unitAmountExTaxPerUnit,
        recurring: {
          interval: item.price.recurring.interval,
          interval_count: item.price.recurring.interval_count ?? 1,
        },
        product: getSubscriptionItemProductId(item),
      },
      quantity: billingContext.quantity,
      proration_behavior: 'none',
    });
  }

  await stripe.subscriptions.update(subscription.id, {
    pause_collection: null,
    metadata: {
      ...subscription.metadata,
      billed_subtotal_cents: String(quote.unitAmountExTax),
      billed_tax_cents: String(quote.taxAmount),
      billed_total_cents: String(quote.unitAmountIncTax),
      subscription_paused_reason: '',
    },
  });

  return pricingChanged || wasPausedForStock ? 'updated' : 'unchanged';
}

export async function listStripeSubscriptionsForProduct(
  productEntityId: number,
): Promise<Stripe.Subscription[]> {
  const stripe = getStripe();
  const subscriptions: Stripe.Subscription[] = [];
  let page: string | undefined;

  do {
    const result = await stripe.subscriptions.search({
      query: `metadata['bigcommerce_product_id']:'${productEntityId}'`,
      limit: 100,
      page,
      expand: ['data.items.data.price.product'],
    });

    subscriptions.push(...result.data);
    page = result.has_more ? (result.next_page ?? undefined) : undefined;
  } while (page);

  return subscriptions.filter((subscription) => subscription.status !== 'canceled');
}

export async function syncStripeSubscriptionsForProduct(productEntityId: number): Promise<{
  productEntityId: number;
  matched: number;
  updated: number;
  paused: number;
  unchanged: number;
  skipped: number;
  failed: number;
}> {
  if (!isStripeConfigured()) {
    return {
      productEntityId,
      matched: 0,
      updated: 0,
      paused: 0,
      unchanged: 0,
      skipped: 0,
      failed: 0,
    };
  }

  const subscriptions = await listStripeSubscriptionsForProduct(productEntityId);
  const summary = {
    productEntityId,
    matched: subscriptions.length,
    updated: 0,
    paused: 0,
    unchanged: 0,
    skipped: 0,
    failed: 0,
  };

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        const result = await syncSubscriptionPricingFromBigCommerce(subscription);

        switch (result) {
          case 'updated':
            summary.updated += 1;
            break;
          case 'paused_out_of_stock':
            summary.paused += 1;
            break;
          case 'unchanged':
            summary.unchanged += 1;
            break;
          case 'skipped':
            summary.skipped += 1;
            break;
        }
      } catch (error) {
        summary.failed += 1;
        // eslint-disable-next-line no-console
        console.error(
          `Failed to sync Stripe subscription ${subscription.id} for product ${productEntityId}:`,
          error,
        );
      }
    }),
  );

  return summary;
}
