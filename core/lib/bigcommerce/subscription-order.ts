import 'server-only';

import {
  type ProductOptionSelection,
  toBigCommerceOrderProductOptions,
} from './product-options';
import {
  buildLinePricesFromTotals,
  formatOrderAmountString,
} from './order-tax';
import { toBigCommerceOrderAddress } from './order-address';
import { bigCommerceAdminFetch } from './rest';
import { parseSubscriptionShippingAddressFromMetadata } from '../checkout/subscription-shipping-metadata';
import type { CheckoutAddressSnapshot } from '../checkout/types';
import { recordRxMaskOrderForCustomer, rxMasksInOrderLines } from '../checkout/rx-order-recording';
import { rxCheckStaffNoteLines, rxMaskOrderRegion } from '../pharmacy/cpap-prescription';

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

/*
 * A renewal holding a complete CPAP mask (owner ruling C26 (b), 2026-10-13):
 * Subscribe & save was offered on complete masks before the ruling, and those
 * subscriptions still renew with no checkout gate before them. So the order
 * gets the same neutral staff note as a checkout order ("RX-CHECK: pharmacist
 * sign-off required before shipping", and "ALWAYS HOLD: QC/territory" when it
 * applies), and it is recorded in the Mask orders queue with the CPAP
 * prescription valid that day, or none (~/lib/checkout/rx-order-recording.ts).
 * Resuming or reactivating one is refused (~/lib/stripe/subscriptions.ts).
 */
function withRxCheckNotes(notes: string, rxMaskCount: number, alwaysHold: boolean): string {
  return rxMaskCount > 0 ? [...rxCheckStaffNoteLines(alwaysHold), '', notes].join('\n') : notes;
}

export async function createBigCommerceSubscriptionOrder(
  input: CreateSubscriptionOrderInput,
): Promise<number> {
  const billingAddress = await getCustomerBillingAddress(input.customerId);
  const quantity = input.quantity ?? 1;
  const rxMasks = await rxMasksInOrderLines([
    { productEntityId: input.productEntityId, name: input.productName },
  ]);
  const rxRegion = rxMaskOrderRegion(billingAddress.state, billingAddress.zip);
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
      staff_notes: withRxCheckNotes(formatStaffNotes(input), rxMasks.size, rxRegion.alwaysHold),
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

  await recordRxMaskOrderForCustomer({
    bigcommerceCustomerId: input.customerId,
    bigcommerceOrderId: order.id,
    masks: rxMasks,
    lines: [{ productId: input.productEntityId ?? 0, name: input.productName, quantity }],
    region: rxRegion.region,
    source: `subscription ${input.stripeReferenceId}`,
  });

  return order.id;
}

export interface BatchedSubscriptionOrderLineInput {
  invoiceReferenceId: string;
  stripeSubscriptionId: string;
  productEntityId?: number;
  productName: string;
  productSku?: string;
  productOptions?: ProductOptionSelection[];
  quantity: number;
  unitAmountExTax: number;
  unitAmountIncTax: number;
}

export interface CreateBatchedSubscriptionOrderInput {
  customerId: number;
  shippingMetadata: Record<string, string>;
  currencyCode: string;
  orderType: 'initial' | 'renewal';
  batchStorageKey: string;
  dayKey: string;
  lines: BatchedSubscriptionOrderLineInput[];
}

async function resolveSubscriptionShippingAddress(
  customerId: number,
  shippingMetadata: Record<string, string>,
): Promise<BigCommerceAddress> {
  const customer = await getCustomerProfile(customerId);
  const parsed = parseSubscriptionShippingAddressFromMetadata(shippingMetadata, customer.email, {
    firstName: customer.first_name,
    lastName: customer.last_name,
  });

  if (parsed?.address1 && parsed.countryCode) {
    const snapshot: CheckoutAddressSnapshot = {
      ...parsed,
      email: customer.email,
    };

    return toBigCommerceOrderAddress(snapshot) as BigCommerceAddress;
  }

  return getCustomerBillingAddress(customerId);
}

function formatBatchedStaffNotes(input: CreateBatchedSubscriptionOrderInput): string {
  const exTaxTotalCents = input.lines.reduce((sum, line) => sum + line.unitAmountExTax, 0);
  const incTaxTotalCents = input.lines.reduce((sum, line) => sum + line.unitAmountIncTax, 0);
  const taxAmount = (incTaxTotalCents - exTaxTotalCents) / 100;

  const lines = [
    `Batched subscription order: ${input.batchStorageKey}`,
    `Shipment day: ${input.dayKey}`,
    `Order type: ${input.orderType}`,
    `Stripe charged: ${(incTaxTotalCents / 100).toFixed(2)} ${input.currencyCode}`,
    `Tax charged: ${taxAmount.toFixed(2)} ${input.currencyCode}`,
    `Line count: ${input.lines.length}`,
    ...input.lines.map(
      (line) =>
        `- ${line.productName} x${line.quantity} (${line.invoiceReferenceId}, sub ${line.stripeSubscriptionId})`,
    ),
  ];

  return lines.join('\n');
}

export async function createBigCommerceBatchedSubscriptionOrder(
  input: CreateBatchedSubscriptionOrderInput,
): Promise<number> {
  const billingAddress = await getCustomerBillingAddress(input.customerId);
  const shippingAddress = await resolveSubscriptionShippingAddress(
    input.customerId,
    input.shippingMetadata,
  );

  const exTaxTotal = input.lines.reduce((sum, line) => sum + line.unitAmountExTax, 0) / 100;
  const incTaxTotal = input.lines.reduce((sum, line) => sum + line.unitAmountIncTax, 0) / 100;
  const rxMasks = await rxMasksInOrderLines(
    input.lines.map((line) => ({ productEntityId: line.productEntityId, name: line.productName })),
  );
  const rxRegion = rxMaskOrderRegion(shippingAddress.state, shippingAddress.zip);

  const products = input.lines.map((line) => {
    const quantity = line.quantity;
    const lineExTaxTotal = line.unitAmountExTax / 100;
    const lineIncTaxTotal = line.unitAmountIncTax / 100;
    const { priceExTax, priceIncTax } = buildLinePricesFromTotals(
      quantity,
      lineExTaxTotal,
      lineIncTaxTotal,
    );
    const productOptions = toBigCommerceOrderProductOptions(line.productOptions ?? []);

    if (line.productEntityId) {
      return {
        product_id: line.productEntityId,
        quantity,
        price_ex_tax: priceExTax,
        price_inc_tax: priceIncTax,
        ...(productOptions.length > 0 ? { product_options: productOptions } : {}),
      };
    }

    return {
      name: line.productName,
      quantity,
      price_ex_tax: priceExTax,
      price_inc_tax: priceIncTax,
    };
  });

  const paymentProviderId = input.lines.map((line) => line.stripeSubscriptionId).join(',');

  const order = await bigCommerceAdminFetch<{ id: number }>('/v2/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: input.customerId,
      status_id: getOrderStatusId(),
      channel_id: getChannelId(),
      payment_method: 'Stripe',
      payment_provider_id: paymentProviderId,
      staff_notes: withRxCheckNotes(
        formatBatchedStaffNotes(input),
        rxMasks.size,
        rxRegion.alwaysHold,
      ),
      customer_message: 'Subscription order',
      subtotal_ex_tax: formatOrderAmountString(exTaxTotal),
      subtotal_inc_tax: formatOrderAmountString(incTaxTotal),
      total_ex_tax: formatOrderAmountString(exTaxTotal),
      total_inc_tax: formatOrderAmountString(incTaxTotal),
      billing_address: billingAddress,
      shipping_addresses: [shippingAddress],
      products,
    }),
  });

  if (!order?.id) {
    throw new Error('BigCommerce order creation did not return an order id');
  }

  await recordRxMaskOrderForCustomer({
    bigcommerceCustomerId: input.customerId,
    bigcommerceOrderId: order.id,
    masks: rxMasks,
    lines: input.lines
      .filter((line) => rxMasks.has(line.productEntityId ?? 0))
      .map((line) => ({
        productId: line.productEntityId ?? 0,
        name: line.productName,
        quantity: line.quantity,
      })),
    region: rxRegion.region,
    source: `subscription shipment ${input.batchStorageKey}`,
  });

  return order.id;
}
