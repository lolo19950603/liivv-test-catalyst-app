import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';

export interface CustomerSubscription {
  id: string;
  status: Stripe.Subscription.Status;
  productName: string;
  unitAmount: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval;
  intervalCount: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  billingCycleAnchor: number | null;
}

function isSubscriptionCancelScheduled(subscription: Stripe.Subscription): boolean {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.cancel_at_period_end) {
    return true;
  }

  return (
    subscription.cancel_at != null &&
    subscription.cancel_at > now &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  );
}

function toCustomerSubscription(
  subscription: Stripe.Subscription,
  productNamesById: Map<string, string>,
): CustomerSubscription | null {
  const item = subscription.items.data[0];

  if (!item?.price.recurring) {
    return null;
  }

  const productName = getSubscriptionProductName(item.price, productNamesById);
  const cancelAtPeriodEnd = isSubscriptionCancelScheduled(subscription);
  const currentPeriodEnd =
    (cancelAtPeriodEnd ? subscription.cancel_at : null) ??
    item.current_period_end ??
    subscription.billing_cycle_anchor ??
    subscription.created;

  return {
    id: subscription.id,
    status: subscription.status,
    productName,
    unitAmount: item.price.unit_amount,
    currency: item.price.currency,
    interval: item.price.recurring.interval,
    intervalCount: item.price.recurring.interval_count,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    trialEnd: subscription.trial_end,
    billingCycleAnchor: subscription.billing_cycle_anchor,
  };
}

function getSubscriptionProductName(
  price: Stripe.Price,
  productNamesById: Map<string, string>,
): string {
  if (price.nickname) {
    return price.nickname;
  }

  const product = price.product;

  if (typeof product === 'string') {
    return productNamesById.get(product) ?? 'Subscription';
  }

  if (product.deleted) {
    return 'Subscription';
  }

  return product.name;
}

async function getProductNamesById(productIds: string[]): Promise<Map<string, string>> {
  const stripe = getStripe();
  const names = new Map<string, string>();

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const product = await stripe.products.retrieve(productId);

        if (!product.deleted) {
          names.set(productId, product.name);
        }
      } catch {
        // Ignore missing products and fall back to a generic label.
      }
    }),
  );

  return names;
}

export async function getCustomerSubscriptions(
  stripeCustomerId: string,
): Promise<CustomerSubscription[]> {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    expand: ['data.items.data.price'],
    limit: 100,
  });

  const productIds = [
    ...new Set(
      subscriptions.data
        .map((subscription) => subscription.items.data[0]?.price.product)
        .filter((product): product is string => typeof product === 'string'),
    ),
  ];

  const productNamesById = await getProductNamesById(productIds);

  return subscriptions.data
    .map((subscription) => toCustomerSubscription(subscription, productNamesById))
    .filter((subscription): subscription is CustomerSubscription => subscription !== null);
}

export async function createBillingPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}
