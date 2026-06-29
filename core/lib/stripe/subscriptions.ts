import 'server-only';

import type Stripe from 'stripe';

import { parseVariantEntityIdFromMetadata, parseVariantLabelFromMetadata } from '~/lib/bigcommerce/product-options';

import { getStripe } from './client';

const PLACEHOLDER_UNIT_AMOUNT = Number(process.env.STRIPE_SUBSCRIPTION_PLACEHOLDER_UNIT_AMOUNT ?? '50');

export interface CustomerSubscription {
  id: string;
  status: Stripe.Subscription.Status;
  productName: string;
  productEntityId?: number;
  variantEntityId?: number;
  variantSubtitle?: string;
  image?: { src: string; alt: string };
  quantity: number;
  unitAmount: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval;
  intervalCount: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  billingCycleAnchor: number | null;
  paymentMethodLabel: string;
  shippingAddressKey: string;
  shippingAddressLabel: string;
  shippingMethodLabel?: string;
  subtotalExTaxCents: number | null;
  taxCents: number | null;
  totalIncTaxCents: number | null;
  priceConfirmedAtBilling: boolean;
  metadata: Stripe.Metadata;
}

function isSubscriptionCancelScheduled(subscription: Stripe.Subscription): boolean {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.cancel_at_period_end) {
    return true;
  }

  return (
    subscription.cancel_at != null &&
    subscription.cancel_at > now &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  );
}

function formatPaymentMethodLabel(
  paymentMethod: Stripe.PaymentMethod | string | null | undefined,
): string {
  if (!paymentMethod || typeof paymentMethod === 'string') {
    return 'Card on file';
  }

  if (paymentMethod.type === 'card' && paymentMethod.card) {
    const brand = paymentMethod.card.brand
      ? paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1)
      : 'Card';

    return `${brand} •••• ${paymentMethod.card.last4}`;
  }

  return 'Card on file';
}

function resolveSubscriptionAmounts(
  item: Stripe.SubscriptionItem,
  metadata: Stripe.Metadata,
): {
  subtotalExTaxCents: number | null;
  taxCents: number | null;
  totalIncTaxCents: number | null;
  priceConfirmedAtBilling: boolean;
} {
  const quantity = item.quantity ?? 1;
  const billedSubtotal = Number(metadata.billed_subtotal_cents ?? '');
  const billedTax = Number(metadata.billed_tax_cents ?? '');
  const billedTotal = Number(metadata.billed_total_cents ?? '');

  if (Number.isFinite(billedSubtotal) && billedSubtotal > 0) {
    return {
      subtotalExTaxCents: billedSubtotal,
      taxCents: Number.isFinite(billedTax) ? billedTax : 0,
      totalIncTaxCents:
        Number.isFinite(billedTotal) && billedTotal > 0
          ? billedTotal
          : billedSubtotal + (Number.isFinite(billedTax) ? billedTax : 0),
      priceConfirmedAtBilling: false,
    };
  }

  const unitAmount = item.price.unit_amount ?? 0;
  const isPlaceholder = unitAmount > 0 && unitAmount <= PLACEHOLDER_UNIT_AMOUNT;

  if (isPlaceholder) {
    return {
      subtotalExTaxCents: null,
      taxCents: null,
      totalIncTaxCents: null,
      priceConfirmedAtBilling: true,
    };
  }

  const subtotalExTaxCents = unitAmount * quantity;

  return {
    subtotalExTaxCents,
    taxCents: 0,
    totalIncTaxCents: subtotalExTaxCents,
    priceConfirmedAtBilling: false,
  };
}

function getBigCommerceProductEntityId(
  metadata: Stripe.Metadata,
  price: Stripe.Price,
  stripeProductInfoById: Map<string, StripeProductInfo>,
): number | undefined {
  const fromMetadata = Number(metadata.bigcommerce_product_id);

  if (Number.isFinite(fromMetadata) && fromMetadata > 0) {
    return fromMetadata;
  }

  const stripeProductId = getStripeProductIdFromPrice(price);

  if (!stripeProductId) {
    return undefined;
  }

  return stripeProductInfoById.get(stripeProductId)?.bigcommerceProductEntityId;
}

function toCustomerSubscription(
  subscription: Stripe.Subscription,
  stripeProductInfoById: Map<string, StripeProductInfo>,
): CustomerSubscription | null {
  const item = subscription.items.data[0];

  if (!item?.price.recurring) {
    return null;
  }

  const productName = getSubscriptionProductName(item.price, stripeProductInfoById);
  const cancelAtPeriodEnd = isSubscriptionCancelScheduled(subscription);
  const currentPeriodEnd =
    (cancelAtPeriodEnd ? subscription.cancel_at : null) ??
    item.current_period_end ??
    subscription.billing_cycle_anchor ??
    subscription.created;
  const amounts = resolveSubscriptionAmounts(item, subscription.metadata);
  const paymentMethod =
    typeof subscription.default_payment_method === 'string'
      ? null
      : subscription.default_payment_method;

  return {
    id: subscription.id,
    status: subscription.status,
    productName,
    productEntityId: getBigCommerceProductEntityId(
      subscription.metadata,
      item.price,
      stripeProductInfoById,
    ),
    variantEntityId: parseVariantEntityIdFromMetadata(subscription.metadata),
    variantSubtitle: parseVariantLabelFromMetadata(subscription.metadata),
    quantity: item.quantity ?? 1,
    unitAmount: item.price.unit_amount,
    currency: item.price.currency,
    interval: item.price.recurring.interval,
    intervalCount: item.price.recurring.interval_count,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    trialEnd: subscription.trial_end,
    billingCycleAnchor: subscription.billing_cycle_anchor,
    paymentMethodLabel: formatPaymentMethodLabel(paymentMethod),
    shippingAddressKey:
      subscription.metadata.shipping_address_key?.trim() || 'default-shipping-address',
    shippingAddressLabel:
      subscription.metadata.shipping_address_label?.trim() || 'Address on file',
    shippingMethodLabel: subscription.metadata.shipping_method_label?.trim() || undefined,
    subtotalExTaxCents: amounts.subtotalExTaxCents,
    taxCents: amounts.taxCents,
    totalIncTaxCents: amounts.totalIncTaxCents,
    priceConfirmedAtBilling: amounts.priceConfirmedAtBilling,
    metadata: subscription.metadata,
  };
}

function getStripeProductIdFromPrice(price: Stripe.Price | undefined): string | undefined {
  if (!price) {
    return undefined;
  }

  return typeof price.product === 'string' ? price.product : price.product?.id;
}

function getExpandedStripeProductName(price: Stripe.Price): string | undefined {
  if (typeof price.product !== 'object' || !price.product || price.product.deleted) {
    return undefined;
  }

  const name = price.product.name?.trim();

  return name || undefined;
}

function getSubscriptionProductName(
  price: Stripe.Price,
  stripeProductInfoById: Map<string, StripeProductInfo>,
): string {
  if (price.nickname?.trim()) {
    return price.nickname.trim();
  }

  const expandedName = getExpandedStripeProductName(price);

  if (expandedName) {
    return expandedName;
  }

  const stripeProductId = getStripeProductIdFromPrice(price);

  if (stripeProductId) {
    const fetchedName = stripeProductInfoById.get(stripeProductId)?.name?.trim();

    if (fetchedName) {
      return fetchedName;
    }
  }

  return 'Subscription';
}

interface StripeProductInfo {
  name: string;
  bigcommerceProductEntityId?: number;
}

async function getStripeProductInfoById(
  productIds: string[],
): Promise<Map<string, StripeProductInfo>> {
  const stripe = getStripe();
  const products = new Map<string, StripeProductInfo>();

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const product = await stripe.products.retrieve(productId);

        if (!product.deleted) {
          const bigcommerceProductEntityId = Number(product.metadata?.bigcommerce_product_id);

          products.set(productId, {
            name: product.name,
            bigcommerceProductEntityId:
              Number.isFinite(bigcommerceProductEntityId) && bigcommerceProductEntityId > 0
                ? bigcommerceProductEntityId
                : undefined,
          });
        }
      } catch {
        // Ignore missing products and fall back to a generic label.
      }
    }),
  );

  return products;
}

export async function getStripeCustomerShippingAddress(
  stripeCustomerId: string,
): Promise<Stripe.Address | null> {
  const stripe = getStripe();

  try {
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    if (customer.deleted) {
      return null;
    }

    return customer.shipping?.address ?? null;
  } catch {
    return null;
  }
}

export async function getCustomerSubscriptions(
  stripeCustomerId: string,
): Promise<CustomerSubscription[]> {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    expand: ['data.items.data.price', 'data.default_payment_method'],
    limit: 100,
  });

  const productIds = [
    ...new Set(
      subscriptions.data
        .map((subscription) => getStripeProductIdFromPrice(subscription.items.data[0]?.price))
        .filter((productId): productId is string => Boolean(productId)),
    ),
  ];

  const stripeProductInfoById = await getStripeProductInfoById(productIds);

  return subscriptions.data
    .map((subscription) => toCustomerSubscription(subscription, stripeProductInfoById))
    .filter((subscription): subscription is CustomerSubscription => subscription !== null);
}

export async function createBillingPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function createSubscriptionBillingPortalSession({
  stripeCustomerId,
  subscriptionId,
  returnUrl,
}: {
  stripeCustomerId: string;
  subscriptionId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
    flow_data: {
      type: 'subscription_update',
      subscription_update: {
        subscription: subscriptionId,
      },
    },
  });

  return session.url;
}
