import 'server-only';

import {
  serializeProductOptionSelections,
  toBigCommerceOrderProductOptions,
} from './product-options';
import { toBigCommerceOrderAddress } from './order-address';
import {
  buildImmediateOrderLineTaxes,
  buildImmediateOrderTaxTotals,
  buildLinePricesWithTax,
} from './order-tax';
import { bigCommerceAdminFetch } from './rest';
import type { CheckoutSnapshot } from '../checkout/types';
import { isDeferredSubscriptionLine } from '../checkout/subscription-charge-timing';

function getOrderStatusId(): number {
  const configured = Number(process.env.STRIPE_BC_ORDER_STATUS_ID ?? '11');

  return Number.isFinite(configured) ? configured : 11;
}

function getChannelId(): number {
  const configured = Number(process.env.BIGCOMMERCE_CHANNEL_ID ?? '1');

  return Number.isFinite(configured) ? configured : 1;
}

export async function createBigCommerceOrderFromCheckoutSnapshot(
  snapshot: CheckoutSnapshot,
  stripeReferenceId: string,
): Promise<number> {
  const billing = snapshot.billingAddress;
  const shipping = snapshot.shippingAddress ?? snapshot.billingAddress;
  const immediateLines = snapshot.lineItems.filter((line) => !isDeferredSubscriptionLine(line));
  const lineTaxes = buildImmediateOrderLineTaxes(snapshot);

  const products = immediateLines.map((line, index) => {
    const productOptions = toBigCommerceOrderProductOptions(line.productOptions);
    const { priceExTax, priceIncTax } = buildLinePricesWithTax(line, lineTaxes[index] ?? 0);

    return {
      product_id: line.productEntityId,
      quantity: line.quantity,
      price_ex_tax: priceExTax,
      price_inc_tax: priceIncTax,
      ...(productOptions.length > 0 ? { product_options: productOptions } : {}),
    };
  });

  if (products.length === 0) {
    throw new Error('Checkout order has no immediate line items to fulfill');
  }

  const staffNotes = [
    `Stripe payment: ${stripeReferenceId}`,
    `Checkout snapshot: ${snapshot.id}`,
    `Stripe charged: ${snapshot.amounts.immediateGrandTotal.toFixed(2)} ${snapshot.currency}`,
    `Tax charged: ${snapshot.amounts.immediateTax.toFixed(2)} ${snapshot.currency}`,
    ...snapshot.lineItems
      .filter((line) => line.isSubscription)
      .map((line) => `Subscription line: ${line.name} (${line.sku ?? line.productEntityId})`),
  ].join('\n');

  const orderTaxTotals = buildImmediateOrderTaxTotals(snapshot);

  const order = await bigCommerceAdminFetch<{ id: number }>('/v2/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: snapshot.bigcommerceCustomerId,
      status_id: getOrderStatusId(),
      channel_id: getChannelId(),
      payment_method: 'Stripe',
      payment_provider_id: stripeReferenceId,
      staff_notes: staffNotes,
      customer_message: 'Custom checkout order',
      ...orderTaxTotals,
      billing_address: toBigCommerceOrderAddress(billing),
      shipping_addresses: [
        toBigCommerceOrderAddress({
          ...shipping,
          address1: shipping.address1 || billing.address1,
          city: shipping.city || billing.city,
          postalCode: shipping.postalCode || billing.postalCode,
          phone: shipping.phone ?? billing.phone,
          email: shipping.email || billing.email,
        }),
      ],
      products,
    }),
  });

  if (!order?.id) {
    throw new Error('BigCommerce order creation did not return an order id');
  }

  return order.id;
}

export function buildSubscriptionMetadataFromLine(
  snapshot: CheckoutSnapshot,
  line: CheckoutSnapshot['lineItems'][number],
): Record<string, string> {
  const serializedOptions = serializeProductOptionSelections(line.productOptions);

  return {
    bigcommerce_customer_id: String(snapshot.bigcommerceCustomerId),
    bigcommerce_product_id: String(line.productEntityId),
    bigcommerce_sku: line.sku ?? '',
    ...(serializedOptions ? { bigcommerce_product_options: serializedOptions } : {}),
    ...(line.billingInterval
      ? {
          subscription_interval: line.billingInterval.interval,
          subscription_interval_count: String(line.billingInterval.intervalCount),
        }
      : {}),
  };
}
