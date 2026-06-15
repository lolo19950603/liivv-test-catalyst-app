import 'server-only';

import {
  serializeProductOptionSelections,
  toBigCommerceOrderProductOptions,
} from './product-options';
import { bigCommerceAdminFetch } from './rest';
import type { CheckoutSnapshot } from '../checkout/types';

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

  const products = snapshot.lineItems.map((line) => {
    const productOptions = toBigCommerceOrderProductOptions(line.productOptions);
    const price = (line.unitAmount / 100).toFixed(2);

    return {
      product_id: line.productEntityId,
      quantity: line.quantity,
      price_inc_tax: Number(price),
      price_ex_tax: Number(price),
      ...(productOptions.length > 0 ? { product_options: productOptions } : {}),
    };
  });

  const staffNotes = [
    `Stripe payment: ${stripeReferenceId}`,
    `Checkout snapshot: ${snapshot.id}`,
    ...snapshot.lineItems
      .filter((line) => line.isSubscription)
      .map((line) => `Subscription line: ${line.name} (${line.sku ?? line.productEntityId})`),
  ].join('\n');

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
      currency_code: snapshot.currency.toUpperCase(),
      shipping_cost_inc_tax: snapshot.shipping,
      shipping_cost_ex_tax: snapshot.shipping,
      total_tax: snapshot.tax,
      billing_address: {
        first_name: billing.firstName,
        last_name: billing.lastName,
        company: billing.company,
        street_1: billing.address1,
        street_2: billing.address2,
        city: billing.city,
        state: billing.stateOrProvince,
        zip: billing.postalCode,
        country: billing.countryCode,
        country_iso2: billing.countryCode,
        phone: billing.phone,
        email: billing.email,
      },
      shipping_addresses: [
        {
          first_name: shipping.firstName,
          last_name: shipping.lastName,
          company: shipping.company,
          street_1: shipping.address1 || billing.address1,
          street_2: shipping.address2,
          city: shipping.city || billing.city,
          state: shipping.stateOrProvince,
          zip: shipping.postalCode || billing.postalCode,
          country: shipping.countryCode,
          country_iso2: shipping.countryCode,
          phone: shipping.phone,
          email: shipping.email,
        },
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
