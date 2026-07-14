import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';
import {
  getNextShipmentTimestampFromStripeSubscription,
  getShipmentCalendarDayKey,
} from './subscription-shipment-grouping';
import { resolveSubscriptionBillingCycleAnchor } from './subscription-schedule-time';
import {
  addBillingInterval,
  parsePendingSkipDays,
  PENDING_SKIP_DAYS_METADATA_KEY,
  serializePendingSkipDays,
} from './subscription-skip-dates';

export function isSubscriptionPaymentFailed(
  status: Stripe.Subscription.Status,
): boolean {
  return status === 'past_due' || status === 'unpaid';
}

async function voidOrDeleteSubscriptionInvoices(
  stripe: Stripe,
  subscriptionId: string,
): Promise<void> {
  const [openInvoices, draftInvoices] = await Promise.all([
    stripe.invoices.list({
      subscription: subscriptionId,
      status: 'open',
      limit: 10,
    }),
    stripe.invoices.list({
      subscription: subscriptionId,
      status: 'draft',
      limit: 10,
    }),
  ]);

  await Promise.all([
    ...openInvoices.data.map(async (invoice) => {
      try {
        await stripe.invoices.voidInvoice(invoice.id);
      } catch {
        // Invoice may have been voided or paid between list and void.
      }
    }),
    ...draftInvoices.data.map(async (invoice) => {
      try {
        await stripe.invoices.del(invoice.id);
      } catch {
        // Draft may already be finalized/deleted.
      }
    }),
  ]);
}

function buildSkipMetadata({
  existing,
  now,
  skipReason,
  shipmentDayKey,
  pendingSkipDays,
}: {
  existing: Stripe.Metadata;
  now: number;
  skipReason: 'customer_skip' | 'payment_deadline';
  shipmentDayKey: string;
  pendingSkipDays: string[];
}): Stripe.MetadataParam {
  const nextPending = pendingSkipDays.filter((day) => day !== shipmentDayKey);
  const metadata: Stripe.MetadataParam = {
    ...existing,
    skipped_delivery_at: String(now),
    shipment_skip_reason: skipReason,
    skipped_shipment_day: shipmentDayKey,
  };

  if (nextPending.length > 0) {
    metadata[PENDING_SKIP_DAYS_METADATA_KEY] = serializePendingSkipDays(nextPending);
  } else {
    metadata[PENDING_SKIP_DAYS_METADATA_KEY] = '';
  }

  return metadata;
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

  // Always clear in-flight invoices so the skipped cycle is not charged.
  await voidOrDeleteSubscriptionInvoices(stripe, subscriptionId);

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
    shipmentDayKey ?? getShipmentCalendarDayKey(getNextShipmentTimestampFromStripeSubscription(subscription));

  await stripe.subscriptions.update(subscriptionId, {
    billing_cycle_anchor: billingCycleAnchor,
    proration_behavior: 'none',
    metadata: buildSkipMetadata({
      existing: subscription.metadata,
      now,
      skipReason,
      shipmentDayKey: resolvedShipmentDayKey,
      pendingSkipDays: parsePendingSkipDays(subscription.metadata),
    }),
  });

  return { ok: true };
}

/**
 * Skip the imminent next delivery immediately, or schedule a later selected delivery date
 * (no charge / no shipment) via pending_skip_days metadata.
 */
export async function scheduleOrSkipSubscriptionDelivery({
  subscriptionId,
  stripeCustomerId,
  shipmentDayKey,
}: {
  subscriptionId: string;
  stripeCustomerId: string;
  shipmentDayKey: string;
}): Promise<
  | { ok: true; mode: 'skipped' | 'scheduled' | 'already_scheduled' }
  | { ok: false; reason: 'not_found' | 'not_failed' | 'invalid' | 'unknown_date' }
> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shipmentDayKey)) {
    return { ok: false, reason: 'invalid' };
  }

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

  const nextDayKey = getShipmentCalendarDayKey(
    getNextShipmentTimestampFromStripeSubscription(subscription),
  );
  const pendingDays = parsePendingSkipDays(subscription.metadata);

  if (shipmentDayKey === nextDayKey) {
    const result = await skipSubscriptionDelivery({
      subscriptionId,
      stripeCustomerId,
      skipReason: 'customer_skip',
      shipmentDayKey,
    });

    if (!result.ok) {
      return result;
    }

    return { ok: true, mode: 'skipped' };
  }

  if (pendingDays.includes(shipmentDayKey)) {
    return { ok: true, mode: 'already_scheduled' };
  }

  // Only allow scheduling dates that land on a projected future billing/shipment cycle.
  const item = subscription.items.data[0];
  const recurring = item?.price.recurring;

  if (!item || !recurring) {
    return { ok: false, reason: 'invalid' };
  }

  const interval = recurring.interval;
  const intervalCount = recurring.interval_count ?? 1;
  let cursor = getNextShipmentTimestampFromStripeSubscription(subscription);
  let matched = false;

  for (let index = 0; index < 12; index += 1) {
    cursor = addBillingInterval(cursor, interval, intervalCount);
    if (getShipmentCalendarDayKey(cursor) === shipmentDayKey) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    return { ok: false, reason: 'unknown_date' };
  }

  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      ...subscription.metadata,
      [PENDING_SKIP_DAYS_METADATA_KEY]: serializePendingSkipDays([...pendingDays, shipmentDayKey]),
    },
  });

  return { ok: true, mode: 'scheduled' };
}

/** If this invoice's shipment day was queued for skip, advance billing and cancel the invoice. */
export async function applyPendingSkipForSubscriptionInvoice({
  invoice,
  subscription,
}: {
  invoice: Stripe.Invoice;
  subscription: Stripe.Subscription;
}): Promise<{ applied: boolean }> {
  const stripeCustomerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!stripeCustomerId) {
    return { applied: false };
  }

  const pendingDays = parsePendingSkipDays(subscription.metadata);

  if (pendingDays.length === 0) {
    return { applied: false };
  }

  const dayKey = getShipmentCalendarDayKey(
    getNextShipmentTimestampFromStripeSubscription(subscription),
  );

  if (!pendingDays.includes(dayKey)) {
    // Also match invoice line period start when present.
    const subscriptionLine = (invoice.lines?.data ?? []).find(
      (line) => line.parent?.type === 'subscription_item_details',
    );
    const lineDayKey = subscriptionLine?.period?.start
      ? getShipmentCalendarDayKey(subscriptionLine.period.start)
      : null;

    if (!lineDayKey || !pendingDays.includes(lineDayKey)) {
      return { applied: false };
    }

    const result = await skipSubscriptionDelivery({
      subscriptionId: subscription.id,
      stripeCustomerId,
      skipReason: 'customer_skip',
      shipmentDayKey: lineDayKey,
    });

    return { applied: result.ok };
  }

  const result = await skipSubscriptionDelivery({
    subscriptionId: subscription.id,
    stripeCustomerId,
    skipReason: 'customer_skip',
    shipmentDayKey: dayKey,
  });

  return { applied: result.ok };
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

  await voidOrDeleteSubscriptionInvoices(stripe, subscriptionId);

  const interval = recurring.interval;
  const intervalCount = recurring.interval_count ?? 1;
  const nextBillingAnchor = addBillingInterval(
    item.current_period_end ?? subscription.current_period_end,
    interval,
    intervalCount,
  );
  const now = Math.floor(Date.now() / 1000);
  const billingCycleAnchor = resolveSubscriptionBillingCycleAnchor(nextBillingAnchor, now);

  await stripe.subscriptions.update(subscriptionId, {
    billing_cycle_anchor: billingCycleAnchor,
    proration_behavior: 'none',
    metadata: buildSkipMetadata({
      existing: subscription.metadata,
      now,
      skipReason: 'payment_deadline',
      shipmentDayKey,
      pendingSkipDays: parsePendingSkipDays(subscription.metadata),
    }),
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
