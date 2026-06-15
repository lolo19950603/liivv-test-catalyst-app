import 'server-only';

import {
  type ProductOptionSelection,
  toBigCommerceOrderProductOptions,
} from './product-options';
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
  unitAmount: number;
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
  const lines = [
    `Stripe subscription: ${input.stripeSubscriptionId}`,
    `Stripe reference: ${input.stripeReferenceId}`,
    `Order type: ${input.orderType}`,
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
  const price = (input.unitAmount / 100).toFixed(2);
  const quantity = input.quantity ?? 1;

  const productOptions = toBigCommerceOrderProductOptions(input.productOptions ?? []);

  const products = input.productEntityId
    ? [
        {
          product_id: input.productEntityId,
          quantity,
          ...(productOptions.length > 0 ? { product_options: productOptions } : {}),
        },
      ]
    : [
        {
          name: input.productName,
          quantity,
          price_inc_tax: Number(price),
          price_ex_tax: Number(price),
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
      currency_code: input.currencyCode.toUpperCase(),
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
