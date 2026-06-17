import 'server-only';

import { toBigCommerceOrderAddress } from './order-address';
import {
  buildLinePricesWithTax,
  buildOrderLineTaxes,
  buildOrderTaxTotals,
} from './order-tax';
import { toBigCommerceOrderProductOptions } from './product-options';
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
  const lineTaxes = buildOrderLineTaxes(snapshot);

  const products = snapshot.lineItems.map((line, index) => {
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
    throw new Error('Checkout order has no line items to fulfill');
  }

  const staffNotes = [
    `Stripe payment: ${stripeReferenceId}`,
    `Checkout snapshot: ${snapshot.id}`,
    `Stripe charged: ${snapshot.amounts.grandTotal.toFixed(2)} ${snapshot.currency}`,
    `Tax charged: ${snapshot.amounts.tax.toFixed(2)} ${snapshot.currency}`,
  ].join('\n');

  const orderTaxTotals = buildOrderTaxTotals(snapshot);

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
