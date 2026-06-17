import 'server-only';

import {
  type ProductOptionSelection,
  toBigCommerceOrderProductOptions,
} from './product-options';
import {
  buildLinePricesFromTotals,
  formatOrderAmountString,
} from './order-tax';
import { bigCommerceAdminFetch } from './rest';

interface BigCommerceAddress {
  first_name: string;
  last_name: string;
  company?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  country_iso2: string;
  phone?: string;
  email: string;
}

interface CustomerAddressResponse {
  first_name: string;
  last_name: string;
  company?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  country_iso2: string;
  phone?: string;
}

interface CustomerResponse {
  email: string;
  first_name: string;
  last_name: string;
}

export interface CreateSubscriptionOrderInput {
  customerId: number;
  productEntityId?: number;
  productName: string;
  productSku?: string;
  productOptions?: ProductOptionSelection[];
  quantity?: number;
  /** Pre-tax line total in cents (catalog/subscription price × quantity). */
  unitAmountExTax: number;
  /** Tax-inclusive line total in cents (amount Stripe charged for this line). */
  unitAmountIncTax: number;
  currencyCode: string;
  stripeSubscriptionId: string;
  stripeReferenceId: string;
  orderType: 'initial' | 'renewal';
}

function getOrderStatusId(): number {
  const configured = Number(process.env.STRIPE_BC_ORDER_STATUS_ID ?? '11');

  return Number.isFinite(configured) ? configured : 11;
}

function getChannelId(): number {
  const configured = Number(process.env.BIGCOMMERCE_CHANNEL_ID ?? '1');

  return Number.isFinite(configured) ? configured : 1;
}

async function getCustomerProfile(customerId: number): Promise<CustomerResponse> {
  return bigCommerceAdminFetch<CustomerResponse>(`/v2/customers/${customerId}`);
}

async function getCustomerBillingAddress(customerId: number): Promise<BigCommerceAddress> {
  const customer = await getCustomerProfile(customerId);
  const addresses = await bigCommerceAdminFetch<CustomerAddressResponse[]>(
    `/v2/customers/${customerId}/addresses`,
  );

  const address = addresses?.[0];

  if (!address?.street_1 || !address.zip) {
    return {
      first_name: customer.first_name || 'Customer',
      last_name: customer.last_name || 'Subscriber',
      street_1: 'Subscription',
      city: 'N/A',
      zip: '00000',
      country: 'United States',
      country_iso2: 'US',
      email: customer.email,
    };
  }

  return {
    first_name: address.first_name || customer.first_name || 'Customer',
    last_name: address.last_name || customer.last_name || 'Subscriber',
    company: address.company,
    street_1: address.street_1,
    street_2: address.street_2,
    city: address.city || 'N/A',
    state: address.state,
    zip: address.zip,
    country: address.country || 'United States',
    country_iso2: address.country_iso2 || 'US',
    phone: address.phone,
    email: customer.email,
  };
}

function formatStaffNotes(input: CreateSubscriptionOrderInput): string {
  const taxAmount = (input.unitAmountIncTax - input.unitAmountExTax) / 100;
  const lines = [
    `Stripe subscription: ${input.stripeSubscriptionId}`,
    `Stripe reference: ${input.stripeReferenceId}`,
    `Order type: ${input.orderType}`,
    `Stripe charged: ${(input.unitAmountIncTax / 100).toFixed(2)} ${input.currencyCode}`,
    `Tax charged: ${taxAmount.toFixed(2)} ${input.currencyCode}`,
  ];

  if (input.productSku) {
    lines.push(`SKU: ${input.productSku}`);
  }

  if (input.productOptions?.length) {
    lines.push(
      `Options: ${input.productOptions
        .map((option) => `${option.optionEntityId}=${option.valueEntityId}`)
        .join(', ')}`,
    );
  }

  return lines.join('\n');
}

export async function createBigCommerceSubscriptionOrder(
  input: CreateSubscriptionOrderInput,
): Promise<number> {
  const billingAddress = await getCustomerBillingAddress(input.customerId);
  const quantity = input.quantity ?? 1;
  const exTaxTotal = input.unitAmountExTax / 100;
  const incTaxTotal = input.unitAmountIncTax / 100;
  const { priceExTax, priceIncTax } = buildLinePricesFromTotals(quantity, exTaxTotal, incTaxTotal);

  const productOptions = toBigCommerceOrderProductOptions(input.productOptions ?? []);

  const products = input.productEntityId
    ? [
        {
          product_id: input.productEntityId,
          quantity,
          price_ex_tax: priceExTax,
          price_inc_tax: priceIncTax,
          ...(productOptions.length > 0 ? { product_options: productOptions } : {}),
        },
      ]
    : [
        {
          name: input.productName,
          quantity,
          price_ex_tax: priceExTax,
          price_inc_tax: priceIncTax,
        },
      ];

  const order = await bigCommerceAdminFetch<{ id: number }>('/v2/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: input.customerId,
      status_id: getOrderStatusId(),
      channel_id: getChannelId(),
      payment_method: 'Stripe',
      payment_provider_id: input.stripeSubscriptionId,
      staff_notes: formatStaffNotes(input),
      customer_message: 'Subscription order',
      subtotal_ex_tax: formatOrderAmountString(exTaxTotal),
      subtotal_inc_tax: formatOrderAmountString(incTaxTotal),
      total_ex_tax: formatOrderAmountString(exTaxTotal),
      total_inc_tax: formatOrderAmountString(incTaxTotal),
      billing_address: billingAddress,
      shipping_addresses: [billingAddress],
      products,
    }),
  });

  if (!order?.id) {
    throw new Error('BigCommerce order creation did not return an order id');
  }

  return order.id;
}
