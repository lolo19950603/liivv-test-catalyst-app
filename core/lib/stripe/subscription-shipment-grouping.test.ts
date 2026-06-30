import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';

import {
  getCurrentShipmentTimestamp,
  getPortalUpcomingShipmentTimestamp,
  getShipmentCalendarDayKey,
  getSubscriptionInvoiceShipmentTimestamp,
} from './subscription-shipment-grouping';

function buildInvoice(period: { start: number; end: number }): Stripe.Invoice {
  return {
    id: 'in_test',
    object: 'invoice',
    lines: {
      data: [
        {
          id: 'il_test',
          object: 'line_item',
          amount: 1000,
          period,
          parent: { type: 'subscription_item_details' },
        } as Stripe.InvoiceLineItem,
      ],
    },
    status_transitions: { paid_at: period.start },
  } as Stripe.Invoice;
}

function buildSubscription(overrides: {
  current_period_start?: number;
  current_period_end?: number;
  billing_cycle_anchor?: number;
}): Stripe.Subscription {
  return {
    id: 'sub_test',
    object: 'subscription',
    billing_cycle_anchor: overrides.billing_cycle_anchor,
    current_period_end: overrides.current_period_end,
    items: {
      object: 'list',
      data: [
        {
          id: 'si_test',
          object: 'subscription_item',
          current_period_start: overrides.current_period_start,
          current_period_end: overrides.current_period_end,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: '/v1/subscription_items',
    },
  } as Stripe.Subscription;
}

describe('subscription shipment grouping', () => {
  process.env.SUBSCRIPTION_SHIPMENT_TIMEZONE = 'America/Toronto';

  it('groups subscriptions on the charge day, not the interval end date', () => {
    const chargeDay = Math.floor(Date.parse('2026-06-30T10:00:00.000Z') / 1000);
    const fourteenDayEnd = Math.floor(Date.parse('2026-07-14T10:00:00.000Z') / 1000);
    const thirtyDayEnd = Math.floor(Date.parse('2026-07-30T10:00:00.000Z') / 1000);

    const fourteenDayShipment = getCurrentShipmentTimestamp({
      trialEnd: null,
      billingCycleAnchor: null,
      currentPeriodStart: chargeDay,
      currentPeriodEnd: fourteenDayEnd,
    });
    const thirtyDayShipment = getCurrentShipmentTimestamp({
      trialEnd: null,
      billingCycleAnchor: null,
      currentPeriodStart: chargeDay,
      currentPeriodEnd: thirtyDayEnd,
    });

    expect(getShipmentCalendarDayKey(fourteenDayShipment)).toBe('2026-06-30');
    expect(getShipmentCalendarDayKey(thirtyDayShipment)).toBe('2026-06-30');
  });

  it('uses invoice period start for batch keys so mixed intervals share one shipment day', () => {
    const chargeDay = Math.floor(Date.parse('2026-06-30T10:00:00.000Z') / 1000);
    const periodEnd = Math.floor(Date.parse('2026-07-14T10:00:00.000Z') / 1000);
    const invoice = buildInvoice({ start: chargeDay, end: periodEnd });
    const subscription = buildSubscription({
      current_period_start: chargeDay,
      current_period_end: periodEnd,
    });

    const shipmentTimestamp = getSubscriptionInvoiceShipmentTimestamp(invoice, subscription);

    expect(getShipmentCalendarDayKey(shipmentTimestamp)).toBe('2026-06-30');
  });

  it('advances portal upcoming shipments to the next charge after the period start passes', () => {
    const now = Math.floor(Date.parse('2026-06-30T16:00:00.000Z') / 1000);
    const periodStart = Math.floor(Date.parse('2026-06-27T10:00:00.000Z') / 1000);
    const periodEnd = Math.floor(Date.parse('2026-07-04T10:00:00.000Z') / 1000);

    const upcoming = getPortalUpcomingShipmentTimestamp(
      {
        trialEnd: null,
        billingCycleAnchor: null,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      now,
    );

    expect(getShipmentCalendarDayKey(upcoming)).toBe('2026-07-04');
  });
});
