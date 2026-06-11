import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';

export interface SubscriptionPlan {
  id: string;
  productId: string;
  productName: string;
  description: string | null;
  unitAmount: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval;
  intervalCount: number;
}

function toSubscriptionPlan(price: Stripe.Price): SubscriptionPlan | null {
  if (!price.recurring) {
    return null;
  }

  const product = price.product;

  if (typeof product === 'string' || product.deleted) {
    return null;
  }

  return {
    id: price.id,
    productId: product.id,
    productName: product.name,
    description: product.description,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring.interval,
    intervalCount: price.recurring.interval_count,
  };
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const stripe = getStripe();
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    expand: ['data.product'],
    limit: 100,
  });

  return prices.data
    .map(toSubscriptionPlan)
    .filter((plan): plan is SubscriptionPlan => plan !== null)
    .sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0));
}
