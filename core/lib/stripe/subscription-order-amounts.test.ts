import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';

import { reconcileSubscriptionOrderAmounts } from './subscription-orders';

function buildInvoice(
  overrides: Partial<Stripe.Invoice> & Pick<Stripe.Invoice, 'amount_paid'>,
): Stripe.Invoice {
  return {
    id: 'in_test',
    object: 'invoice',
    lines: { data: [] },
    ...overrides,
  } as Stripe.Invoice;
}

describe('reconcileSubscriptionOrderAmounts', () => {
  it('keeps matching metadata totals unchanged', () => {
    const result = reconcileSubscriptionOrderAmounts({
      invoice: buildInvoice({ amount_paid: 2500 }),
      unitAmountExTax: 2218,
      unitAmountIncTax: 2500,
      metadata: { billed_tax_cents: '282' },
    });

    expect(result).toEqual({
      unitAmountExTax: 2218,
      unitAmountIncTax: 2500,
      reconciled: false,
    });
  });

  it('uses invoice line subtotal when metadata ex-tax exceeds amount paid', () => {
    const result = reconcileSubscriptionOrderAmounts({
      invoice: buildInvoice({
        amount_paid: 50,
        lines: {
          data: [
            {
              amount: 50,
              description: 'Subscription item',
              parent: { type: 'subscription_item_details' },
            } as Stripe.InvoiceLineItem,
          ],
        },
      }),
      unitAmountExTax: 2218,
      unitAmountIncTax: 50,
      metadata: { billed_tax_cents: '282' },
    });

    expect(result.unitAmountExTax).toBe(50);
    expect(result.unitAmountIncTax).toBe(50);
    expect(result.reconciled).toBe(true);
  });

  it('derives ex-tax from paid amount and billed tax when invoice lines are unavailable', () => {
    const result = reconcileSubscriptionOrderAmounts({
      invoice: buildInvoice({ amount_paid: 2500 }),
      unitAmountExTax: 5000,
      unitAmountIncTax: 2500,
      metadata: { billed_tax_cents: '282' },
    });

    expect(result.unitAmountExTax).toBe(2218);
    expect(result.unitAmountIncTax).toBe(2500);
    expect(result.reconciled).toBe(true);
  });
});
