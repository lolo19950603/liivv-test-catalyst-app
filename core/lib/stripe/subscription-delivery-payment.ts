import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';
import { getShipmentCalendarDayKey } from './subscription-shipment-grouping';
import { resolveSubscriptionBillingCycleAnchor } from './subscription-schedule-time';

export function isSubscriptionPaymentFailed(
  status: Stripe.Subscription.Status,
): boolean {
  return status === 'past_due' || status === 'unpaid';
}

function addBillingInterval(
  fromTimestamp: number,
  interval: Stripe.Price.Recurring.Interval,
  intervalCount: number,
): number {
  const date = new Date(fromTimestamp * 1000);

  switch (interval) {
    case 'day':
      date.setUTCDate(date.getUTCDate() + intervalCount);
      break;
    case 'week':
      date.setUTCDate(date.getUTCDate() + 7 * intervalCount);
      break;
    case 'month':
      date.setUTCMonth(date.getUTCMonth() + intervalCount);
      break;
    case 'year':
      date.setUTCFullYear(date.getUTCFullYear() + intervalCount);
      break;
  }

  return Math.floor(date.getTime() / 1000);
}

async function voidOpenSubscriptionInvoices(
  stripe: Stripe,
  subscriptionId: string,
): Promise<void> {
  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: 'open',
    limit: 10,
  });

  await Promise.all(
    invoices.data.map(async (invoice) => {
      try {
        await stripe.invoices.voidInvoice(invoice.id);
      } catch {
        // Invoice may have been voided or paid between list and void.
      }
    }),
  );
}

export async function skipSubscriptionDelivery({
  subscriptionId,
  stripeCustomerId,
  skipReason = 'customer_skip',
  shipmentDayKey,
}: {
  subscriptionId: string;
  stripeCustomerId: string;
  skipReason?: 'customer_skip' | 'payment_deadline';
  shipmentDayKey?: string;
}): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'not_failed' | 'invalid' }> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId || customerId !== stripeCustomerId) {
    return { ok: false, reason: 'not_found' };
  }

  const paymentFailed = isSubscriptionPaymentFailed(subscription.status);
  const canSkip =
    paymentFailed ||
    subscription.status === 'active' ||
    subscription.status === 'trialing';

  if (!canSkip) {
    return { ok: false, reason: 'not_failed' };
  }

  const item = subscription.items.data[0];
  const recurring = item?.price.recurring;

  if (!item || !recurring) {
    return { ok: false, reason: 'invalid' };
  }

  if (paymentFailed) {
    await voidOpenSubscriptionInvoices(stripe, subscriptionId);
  }

  const interval = recurring.interval;
  const intervalCount = recurring.interval_count ?? 1;
  const periodEnd =
    item.current_period_end ??
    subscription.billing_cycle_anchor ??
    subscription.current_period_end ??
    Math.floor(Date.now() / 1000);
  const nextBillingAnchor = addBillingInterval(periodEnd, interval, intervalCount);
  const now = Math.floor(Date.now() / 1000);
  const billingCycleAnchor = resolveSubscriptionBillingCycleAnchor(nextBillingAnchor, now);
  const resolvedShipmentDayKey =
    shipmentDayKey ?? getShipmentCalendarDayKey(periodEnd);

  await stripe.subscriptions.update(subscriptionId, {
    billing_cycle_anchor: billingCycleAnchor,
    proration_behavior: 'none',
    metadata: {
      ...subscription.metadata,
      skipped_delivery_at: String(now),
      shipment_skip_reason: skipReason,
      skipped_shipment_day: resolvedShipmentDayKey,
    },
  });

  return { ok: true };
}

/** Clears open invoices and advances billing when auto-skip fails but the cycle must still move on. */
export async function releaseSubscriptionFromFailedShipmentDeadline({
  subscriptionId,
  stripeCustomerId,
  shipmentDayKey,
}: {
  subscriptionId: string;
  stripeCustomerId: string;
  shipmentDayKey: string;
}): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'invalid' }> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId || customerId !== stripeCustomerId) {
    return { ok: false, reason: 'not_found' };
  }

  const item = subscription.items.data[0];
  const recurring = item?.price.recurring;

  if (!item || !recurring) {
    return { ok: false, reason: 'invalid' };
  }

  await voidOpenSubscriptionInvoices(stripe, subscriptionId);

  const interval = recurring.interval;
  const intervalCount = recurring.interval_count ?? 1;
  const nextBillingAnchor = addBillingInterval(
    subscription.current_period_end,
    interval,
    intervalCount,
  );
  const now = Math.floor(Date.now() / 1000);
  const billingCycleAnchor = resolveSubscriptionBillingCycleAnchor(nextBillingAnchor, now);

  await stripe.subscriptions.update(subscriptionId, {
    billing_cycle_anchor: billingCycleAnchor,
    proration_behavior: 'none',
    metadata: {
      ...subscription.metadata,
      skipped_delivery_at: String(now),
      shipment_skip_reason: 'payment_deadline',
      skipped_shipment_day: shipmentDayKey,
    },
  });

  return { ok: true };
}

async function getOpenSubscriptionInvoiceId(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const latestInvoice = subscription.latest_invoice;
  const latestInvoiceId =
    typeof latestInvoice === 'string' ? latestInvoice : latestInvoice?.id;

  if (latestInvoiceId) {
    const latest = await stripe.invoices.retrieve(latestInvoiceId);

    if (latest.status === 'open') {
      return latest.id;
    }
  }

  const openInvoices = await stripe.invoices.list({
    subscription: subscription.id,
    status: 'open',
    limit: 1,
  });

  return openInvoices.data[0]?.id ?? null;
}

export async function retrySubscriptionPayment({
  subscriptionId,
  stripeCustomerId,
}: {
  subscriptionId: string;
  stripeCustomerId: string;
}): Promise<
  { ok: true } | { ok: false; reason: 'not_found' | 'not_failed' | 'no_invoice' | 'invalid' }
> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId || customerId !== stripeCustomerId) {
    return { ok: false, reason: 'not_found' };
  }

  if (!isSubscriptionPaymentFailed(subscription.status)) {
    return { ok: false, reason: 'not_failed' };
  }

  const invoiceId = await getOpenSubscriptionInvoiceId(stripe, subscription);

  if (!invoiceId) {
    return { ok: false, reason: 'no_invoice' };
  }

  try {
    await stripe.invoices.pay(invoiceId);
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  return { ok: true };
}
