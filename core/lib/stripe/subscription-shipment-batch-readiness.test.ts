import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';

import type { CustomerSubscription } from './subscriptions';
import type { SubscriptionOrderBatch } from './subscription-order-batch';
import { getShipmentBatchReadiness } from './finalize-subscription-shipment';

function buildSubscription(
  overrides: Partial<CustomerSubscription> & Pick<CustomerSubscription, 'id'>,
): CustomerSubscription {
  return {
    status: 'active',
    productName: 'Test product',
    quantity: 1,
    unitAmount: 1000,
    currency: 'usd',
    interval: 'month',
    intervalCount: 1,
    currentPeriodEnd: 0,
    cancelAtPeriodEnd: false,
    trialEnd: null,
    billingCycleAnchor: null,
    paymentMethodLabel: 'Visa',
    shippingAddressKey: 'addr-1',
    shippingAddressLabel: 'Home',
    subtotalExTaxCents: 1000,
    taxCents: 0,
    totalIncTaxCents: 1000,
    priceConfirmedAtBilling: true,
    metadata: {},
    ...overrides,
  };
}

function buildBatch(items: SubscriptionOrderBatch['items']): SubscriptionOrderBatch {
  return {
    customerId: 1,
    dayKey: '2026-07-04',
    shippingAddressKey: 'addr-1',
    shippingMetadata: {},
    currencyCode: 'USD',
    orderType: 'renewal',
    items,
    updatedAt: Date.now(),
  };
}

describe('getShipmentBatchReadiness', () => {
  const dayKey = '2026-07-04';
  const shippingAddressKey = 'addr-1';

  it('returns pending when batch is empty', () => {
    expect(
      getShipmentBatchReadiness({
        groupSubscriptions: [buildSubscription({ id: 'sub_a' })],
        batch: null,
        dayKey,
        shippingAddressKey,
        pastCutoff: false,
      }),
    ).toBe('pending');
  });

  it('returns pending when an active subscription has not paid yet', () => {
    const readiness = getShipmentBatchReadiness({
      groupSubscriptions: [
        buildSubscription({ id: 'sub_a' }),
        buildSubscription({ id: 'sub_b' }),
      ],
      batch: buildBatch([
        {
          invoiceReferenceId: 'invoice:in_a',
          stripeSubscriptionId: 'sub_a',
          productName: 'A',
          quantity: 1,
          unitAmountExTax: 1000,
          unitAmountIncTax: 1000,
        },
      ]),
      dayKey,
      shippingAddressKey,
      pastCutoff: false,
    });

    expect(readiness).toBe('pending');
  });

  it('returns ready when every subscription in the group is paid', () => {
    const readiness = getShipmentBatchReadiness({
      groupSubscriptions: [
        buildSubscription({ id: 'sub_a' }),
        buildSubscription({ id: 'sub_b' }),
      ],
      batch: buildBatch([
        {
          invoiceReferenceId: 'invoice:in_a',
          stripeSubscriptionId: 'sub_a',
          productName: 'A',
          quantity: 1,
          unitAmountExTax: 1000,
          unitAmountIncTax: 1000,
        },
        {
          invoiceReferenceId: 'invoice:in_b',
          stripeSubscriptionId: 'sub_b',
          productName: 'B',
          quantity: 1,
          unitAmountExTax: 2000,
          unitAmountIncTax: 2000,
        },
      ]),
      dayKey,
      shippingAddressKey,
      pastCutoff: false,
    });

    expect(readiness).toBe('ready');
  });

  it('returns ready when unpaid subscriptions were customer-skipped for this shipment', () => {
    const readiness = getShipmentBatchReadiness({
      groupSubscriptions: [
        buildSubscription({ id: 'sub_a' }),
        buildSubscription({
          id: 'sub_b',
          metadata: {
            skipped_shipment_day: dayKey,
            shipping_address_key: shippingAddressKey,
          } as Stripe.Metadata,
        }),
      ],
      batch: buildBatch([
        {
          invoiceReferenceId: 'invoice:in_a',
          stripeSubscriptionId: 'sub_a',
          productName: 'A',
          quantity: 1,
          unitAmountExTax: 1000,
          unitAmountIncTax: 1000,
        },
      ]),
      dayKey,
      shippingAddressKey,
      pastCutoff: false,
    });

    expect(readiness).toBe('ready');
  });

  it('blocks before cutoff when a subscription payment failed', () => {
    const readiness = getShipmentBatchReadiness({
      groupSubscriptions: [
        buildSubscription({ id: 'sub_a' }),
        buildSubscription({ id: 'sub_b', status: 'past_due' }),
      ],
      batch: buildBatch([
        {
          invoiceReferenceId: 'invoice:in_a',
          stripeSubscriptionId: 'sub_a',
          productName: 'A',
          quantity: 1,
          unitAmountExTax: 1000,
          unitAmountIncTax: 1000,
        },
      ]),
      dayKey,
      shippingAddressKey,
      pastCutoff: false,
    });

    expect(readiness).toBe('blocked_failed_payment');
  });

  it('returns ready after cutoff when a subscription payment failed', () => {
    const readiness = getShipmentBatchReadiness({
      groupSubscriptions: [
        buildSubscription({ id: 'sub_a' }),
        buildSubscription({ id: 'sub_b', status: 'past_due' }),
      ],
      batch: buildBatch([
        {
          invoiceReferenceId: 'invoice:in_a',
          stripeSubscriptionId: 'sub_a',
          productName: 'A',
          quantity: 1,
          unitAmountExTax: 1000,
          unitAmountIncTax: 1000,
        },
      ]),
      dayKey,
      shippingAddressKey,
      pastCutoff: true,
    });

    expect(readiness).toBe('ready');
  });
});
