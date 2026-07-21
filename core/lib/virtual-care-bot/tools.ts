import 'server-only';

import { revalidateTag } from 'next/cache';

import { getSearchResults } from '~/client/queries/get-search-results';
import { TAGS } from '~/client/tags';
import { getCustomerOrders } from '~/app/[locale]/(default)/account/(portal)/orders/page-data';
import {
  resolveStripeCustomerIdForAccount,
  syncSubscriptionShipmentsForAccount,
} from '~/app/[locale]/(default)/account/(portal)/subscriptions/page-data';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import {
  saveCheckoutAddress,
  type SaveCheckoutAddressInput,
} from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';
import { addToOrCreateCart } from '~/lib/cart';
import { customerAddressToSnapshot } from '~/lib/account/saved-shipping-addresses';
import { formatShippingAddressLabel } from '~/lib/checkout/subscription-shipping-metadata';
import { isStripeConfigured } from '~/lib/stripe/client';
import {
  cancelCustomerSubscription,
  getCustomerSubscriptions,
  pauseCustomerSubscription,
  resumeCustomerSubscription,
  updateSubscriptionFrequency,
  updateSubscriptionShippingAddress,
  type CustomerSubscription,
} from '~/lib/stripe/subscriptions';
import { skipSubscriptionDelivery } from '~/lib/stripe/subscription-delivery-payment';
import {
  formatSubscriptionIntervalKey,
  getSubscriptionBillingIntervals,
} from '~/lib/stripe/subscription-interval';
import {
  listPrescriptionsByProfileId,
  listRefillRequestsByProfileId,
} from '~/lib/supabase/prescriptions';

import { formatHelpTopicsForPrompt, getHelpTopics } from './knowledge-base';
import { getAppBaseUrl } from './config';

function formatMoney(value: number | string | undefined, currency: string | undefined): string {
  if (value == null || value === '') {
    return '';
  }

  const num = typeof value === 'string' ? Number(value) : value;

  if (Number.isNaN(num)) {
    return '';
  }

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency || 'CAD',
  }).format(num);
}

function stockLabel(product: {
  inventory?: {
    isInStock?: boolean | null;
    aggregated?: {
      availableOnHand?: number | null;
      availableForBackorder?: boolean | number | null;
    } | null;
  } | null;
}): string {
  const inv = product.inventory;

  if (!inv) {
    return 'Stock unknown';
  }

  if (inv.isInStock) {
    const onHand = inv.aggregated?.availableOnHand;

    return onHand != null ? `In stock (${onHand} on hand)` : 'In stock';
  }

  if (Boolean(inv.aggregated?.availableForBackorder)) {
    return 'Out of stock — available for backorder';
  }

  return 'Out of stock';
}

export async function toolSearchProducts(query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return { products: [] as Array<Record<string, string>> };
  }

  const result = await getSearchResults(trimmed);
  const base = getAppBaseUrl();

  if (result.status !== 'success' || !result.data) {
    return {
      error: result.status === 'error' ? result.error : 'Search failed.',
      products: [] as Array<Record<string, string>>,
    };
  }

  const products = result.data.products.slice(0, 5).map((product) => {
    const price =
      product.prices?.salePrice?.value ??
      product.prices?.price?.value ??
      product.prices?.priceRange?.min?.value;
    const currency =
      product.prices?.salePrice?.currencyCode ??
      product.prices?.price?.currencyCode ??
      product.prices?.priceRange?.min?.currencyCode;

    return {
      productEntityId: String(product.entityId),
      name: product.name,
      path: product.path ? `${base}${product.path}` : '',
      price: formatMoney(price, currency),
      stock: stockLabel({ inventory: product.inventory }),
    };
  });

  return { products };
}

export async function toolAddToCart(productEntityId: number, quantity = 1) {
  const base = getAppBaseUrl();
  const cartUrl = `${base}/cart`;
  const qty = Number.isFinite(quantity) ? Math.floor(quantity) : 1;

  if (!Number.isFinite(productEntityId) || productEntityId <= 0) {
    return {
      ok: false,
      message: 'A valid productEntityId is required. Search products first, then add by id.',
      cartUrl,
    };
  }

  if (qty < 1 || qty > 50) {
    return {
      ok: false,
      message: 'Quantity must be between 1 and 50.',
      cartUrl,
    };
  }

  try {
    const result = await addToOrCreateCart({
      lineItems: [
        {
          productEntityId,
          quantity: qty,
        },
      ],
    });

    return {
      ok: true,
      message: `Added ${qty} item(s) to the cart.`,
      productEntityId: String(productEntityId),
      quantity: String(qty),
      cartUrl,
      cartId: result.cartId,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Could not add to cart.';

    return {
      ok: false,
      message: `Could not add that product to the cart. It may require options (size/flavor) — send the customer the product page link from search_products instead. (${detail.slice(0, 200)})`,
      cartUrl,
      productEntityId: String(productEntityId),
    };
  }
}

type PurchaseAgg = {
  productEntityId: string;
  name: string;
  path: string;
  timesOrdered: number;
  totalQuantity: number;
};

export async function toolGetPurchaseStats(orderLimit = 25) {
  const base = getAppBaseUrl();
  const ordersPageUrl = `${base}/account/orders`;
  const cartUrl = `${base}/cart`;
  const limit = Math.min(Math.max(Math.floor(orderLimit) || 25, 1), 50);

  try {
    const data = await getCustomerOrders({ limit });

    if (!data) {
      return {
        ok: false,
        message: 'Could not load order history right now.',
        ordersAnalyzed: '0',
        topPurchases: [] as PurchaseAgg[],
        ordersPageUrl,
        cartUrl,
      };
    }

    const byProduct = new Map<string, PurchaseAgg>();
    let lineItemCount = 0;

    for (const order of data.orders) {
      const consignments = order.consignments?.shipping ?? [];

      for (const consignment of consignments) {
        for (const item of consignment.lineItems ?? []) {
          lineItemCount += 1;
          const id = String(item.productEntityId);
          const existing = byProduct.get(id);
          const path = item.baseCatalogProduct?.path
            ? `${base}${item.baseCatalogProduct.path}`
            : '';

          if (existing) {
            existing.timesOrdered += 1;
            existing.totalQuantity += item.quantity;
          } else {
            byProduct.set(id, {
              productEntityId: id,
              name: item.name,
              path,
              timesOrdered: 1,
              totalQuantity: item.quantity,
            });
          }
        }
      }
    }

    const topPurchases = [...byProduct.values()]
      .sort((a, b) => b.totalQuantity - a.totalQuantity || b.timesOrdered - a.timesOrdered)
      .slice(0, 10)
      .map((row, index) => ({
        rank: String(index + 1),
        productEntityId: row.productEntityId,
        name: row.name,
        path: row.path,
        timesOrdered: String(row.timesOrdered),
        totalQuantity: String(row.totalQuantity),
      }));

    const numberOne = topPurchases[0] ?? null;

    return {
      ok: true,
      message:
        topPurchases.length > 0
          ? `Analyzed ${data.orders.length} recent order(s) and ${lineItemCount} line item(s).`
          : `Found ${data.orders.length} order(s) but no product line items to rank.`,
      ordersAnalyzed: String(data.orders.length),
      uniqueProducts: String(byProduct.size),
      numberOnePurchase: numberOne
        ? {
            name: numberOne.name,
            productEntityId: numberOne.productEntityId,
            totalQuantity: numberOne.totalQuantity,
            timesOrdered: numberOne.timesOrdered,
            path: numberOne.path,
          }
        : null,
      topPurchases,
      ordersPageUrl,
      cartUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Purchase stats failed.',
      ordersAnalyzed: '0',
      topPurchases: [] as Array<Record<string, string>>,
      ordersPageUrl,
      cartUrl,
    };
  }
}

export async function toolGetRecentOrders(limit = 3) {
  const base = getAppBaseUrl();
  const ordersPageUrl = `${base}/account/orders`;

  try {
    const data = await getCustomerOrders({ limit });

    if (!data) {
      return {
        authenticated: true,
        ok: false,
        message:
          'Could not load orders right now. Ask the customer to open their orders page, or try again shortly.',
        orders: [] as Array<Record<string, string>>,
        ordersPageUrl,
      };
    }

    if (!data.orders.length) {
      return {
        authenticated: true,
        ok: true,
        message: 'This customer has no recent orders on file.',
        orders: [] as Array<Record<string, string>>,
        ordersPageUrl,
      };
    }

    const orders = data.orders.map((order) => ({
      orderNumber: String(order.entityId),
      status: order.status?.label ?? 'Unknown',
      orderedAt: order.orderedAt?.utc ?? '',
      total: formatMoney(order.totalIncTax?.value, order.totalIncTax?.currencyCode),
      url: `${base}/account/orders/${order.entityId}`,
    }));

    return {
      authenticated: true,
      ok: true,
      message: `Found ${orders.length} recent order(s).`,
      orders,
      ordersPageUrl,
    };
  } catch (error) {
    return {
      authenticated: true,
      ok: false,
      message: error instanceof Error ? error.message : 'Order lookup failed.',
      orders: [] as Array<Record<string, string>>,
      ordersPageUrl,
    };
  }
}

export async function toolGetPrescriptionStatus(profileId: string) {
  const [prescriptions, refills] = await Promise.all([
    listPrescriptionsByProfileId(profileId),
    listRefillRequestsByProfileId(profileId),
  ]);

  const base = getAppBaseUrl();

  return {
    pharmacyPageUrl: `${base}/account/pharmacy`,
    prescriptions: prescriptions.slice(0, 10).map((rx) => ({
      medication: rx.medication_name,
      status: rx.status ?? 'unknown',
      approvalStatus: rx.approval_status ?? 'unknown',
      refillsRemaining: rx.refills_remaining != null ? String(rx.refills_remaining) : '',
      updatedAt: rx.updated_at,
    })),
    refillRequests: refills.slice(0, 5).map((req) => ({
      status: req.status,
      submittedAt: req.created_at,
      prescriptionCount: String(req.prescription_ids.length),
    })),
  };
}

export function toolGetHelpTopics() {
  return {
    topics: getHelpTopics().map((t) => ({
      id: t.id,
      title: t.title,
      path: t.path,
      steps: t.steps,
    })),
    formatted: formatHelpTopicsForPrompt(),
  };
}

const CANCELABLE_SUBSCRIPTION_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'paused',
]);

const MANAGEABLE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);

function formatUnixDate(seconds: number): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      dateStyle: 'medium',
    }).format(new Date(seconds * 1000));
  } catch {
    return '';
  }
}

function formatFrequencyLabel(interval: string, intervalCount: number): string {
  return `every ${intervalCount} ${interval}${intervalCount === 1 ? '' : 's'}`;
}

function getAllowedFrequencyOptions() {
  return getSubscriptionBillingIntervals().map((interval) => ({
    intervalKey: formatSubscriptionIntervalKey(interval),
    label: formatFrequencyLabel(interval.interval, interval.intervalCount),
  }));
}

function subscriptionsPageUrl() {
  return `${getAppBaseUrl()}/account/subscriptions`;
}

async function resolveOwnedSubscription(subscriptionId: string): Promise<
  | { ok: true; stripeCustomerId: string; subscription: CustomerSubscription }
  | { ok: false; message: string }
> {
  if (!isStripeConfigured()) {
    return { ok: false, message: 'Subscriptions are not available right now.' };
  }

  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId) {
    return { ok: false, message: 'No Stripe customer found for this account.' };
  }

  const id = subscriptionId.trim();

  if (!id) {
    return { ok: false, message: 'subscriptionId is required. Use list_subscriptions first.' };
  }

  const subscriptions = await getCustomerSubscriptions(stripeCustomerId);
  const subscription = subscriptions.find((sub) => sub.id === id);

  if (!subscription) {
    return {
      ok: false,
      message: 'That subscription was not found on this account. Use list_subscriptions first.',
    };
  }

  return { ok: true, stripeCustomerId, subscription };
}

export async function toolListSubscriptions() {
  const subscriptionsUrl = subscriptionsPageUrl();
  const allowedFrequencies = getAllowedFrequencyOptions();

  if (!isStripeConfigured()) {
    return {
      ok: false,
      message: 'Subscriptions are not available right now.',
      subscriptions: [] as Array<Record<string, string>>,
      allowedFrequencies,
      subscriptionsUrl,
    };
  }

  try {
    const stripeCustomerId = await resolveStripeCustomerIdForAccount();

    if (!stripeCustomerId) {
      return {
        ok: true,
        message: 'No Stripe customer / subscriptions found for this account.',
        subscriptions: [] as Array<Record<string, string>>,
        allowedFrequencies,
        subscriptionsUrl,
      };
    }

    const subscriptions = await getCustomerSubscriptions(stripeCustomerId);
    const mapped = subscriptions.map((sub) => {
      const canCancel = CANCELABLE_SUBSCRIPTION_STATUSES.has(sub.status) && !sub.cancelAtPeriodEnd;
      const canSkip = MANAGEABLE_SUBSCRIPTION_STATUSES.has(sub.status) && !sub.collectionPaused;
      const canPause =
        (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') &&
        !sub.collectionPaused;
      const canResume = sub.collectionPaused || sub.status === 'paused';
      const canChangeFrequency =
        (sub.status === 'active' || sub.status === 'trialing') && !sub.collectionPaused;

      return {
        subscriptionId: sub.id,
        productName: sub.productName,
        variant: sub.variantSubtitle ?? '',
        status: sub.status,
        collectionPaused: sub.collectionPaused ? 'yes' : 'no',
        quantity: String(sub.quantity),
        frequency: formatFrequencyLabel(sub.interval, sub.intervalCount),
        intervalKey: formatSubscriptionIntervalKey({
          interval: sub.interval,
          intervalCount: sub.intervalCount,
        }),
        nextBillingDate: formatUnixDate(sub.currentPeriodEnd),
        cancelScheduled: sub.cancelAtPeriodEnd ? 'yes' : 'no',
        canCancel: canCancel ? 'yes' : 'no',
        canPause: canPause ? 'yes' : 'no',
        canResume: canResume ? 'yes' : 'no',
        canSkip: canSkip ? 'yes' : 'no',
        canChangeFrequency: canChangeFrequency ? 'yes' : 'no',
        shippingAddress: sub.shippingAddressLabel || 'Address on file',
        amount:
          sub.totalIncTaxCents != null
            ? formatMoney(sub.totalIncTaxCents / 100, sub.currency.toUpperCase())
            : '',
      };
    });

    return {
      ok: true,
      message:
        mapped.length === 0
          ? 'This customer has no subscriptions on file.'
          : `Found ${mapped.length} subscription(s). Use canPause/canSkip/canChangeFrequency/canCancel flags before managing.`,
      subscriptions: mapped,
      allowedFrequencies,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not load subscriptions.',
      subscriptions: [] as Array<Record<string, string>>,
      allowedFrequencies,
      subscriptionsUrl,
    };
  }
}

export async function toolCancelSubscription({
  subscriptionId,
  cancellationReason,
  confirmed,
}: {
  subscriptionId: string;
  cancellationReason: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();
  const reason = cancellationReason.trim();

  if (!confirmed) {
    return {
      ok: false,
      cancelled: false,
      message:
        'Cancellation not run. First list subscriptions, confirm the exact subscription with the customer in chat, then call again with confirmed=true.',
      subscriptionsUrl,
    };
  }

  if (!reason) {
    return {
      ok: false,
      cancelled: false,
      message: 'cancellationReason is required.',
      subscriptionsUrl,
    };
  }

  try {
    const resolved = await resolveOwnedSubscription(subscriptionId);

    if (!resolved.ok) {
      return { ok: false, cancelled: false, message: resolved.message, subscriptionsUrl };
    }

    const { stripeCustomerId, subscription } = resolved;

    if (!CANCELABLE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
      return {
        ok: false,
        cancelled: false,
        message: `This subscription cannot be cancelled (status: ${subscription.status}).`,
        subscriptionId: subscription.id,
        productName: subscription.productName,
        subscriptionsUrl,
      };
    }

    await cancelCustomerSubscription({
      stripeCustomerId,
      subscriptionId: subscription.id,
      cancellationReason: reason,
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      ok: true,
      cancelled: true,
      message: `Cancelled subscription for ${subscription.productName}. Billing will stop; link them to Subscriptions if they want to review or reactivate.`,
      subscriptionId: subscription.id,
      productName: subscription.productName,
      cancellationReason: reason,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      cancelled: false,
      message: error instanceof Error ? error.message : 'Unable to cancel subscription.',
      subscriptionId,
      subscriptionsUrl,
    };
  }
}

export async function toolPauseSubscription({
  subscriptionId,
  confirmed,
}: {
  subscriptionId: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();

  if (!confirmed) {
    return {
      ok: false,
      message:
        'Pause not run. Confirm the subscription with the customer, then call again with confirmed=true.',
      subscriptionsUrl,
    };
  }

  try {
    const resolved = await resolveOwnedSubscription(subscriptionId);

    if (!resolved.ok) {
      return { ok: false, message: resolved.message, subscriptionsUrl };
    }

    const { stripeCustomerId, subscription } = resolved;

    if (subscription.collectionPaused) {
      return {
        ok: true,
        message: `${subscription.productName} is already paused.`,
        subscriptionId: subscription.id,
        productName: subscription.productName,
        subscriptionsUrl,
      };
    }

    await pauseCustomerSubscription({
      stripeCustomerId,
      subscriptionId: subscription.id,
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      ok: true,
      message: `Paused billing/collection for ${subscription.productName}. They can resume anytime in chat or on Subscriptions.`,
      subscriptionId: subscription.id,
      productName: subscription.productName,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to pause subscription.',
      subscriptionId,
      subscriptionsUrl,
    };
  }
}

export async function toolResumeSubscription({
  subscriptionId,
  confirmed,
}: {
  subscriptionId: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();

  if (!confirmed) {
    return {
      ok: false,
      message:
        'Resume not run. Confirm the subscription with the customer, then call again with confirmed=true.',
      subscriptionsUrl,
    };
  }

  try {
    const resolved = await resolveOwnedSubscription(subscriptionId);

    if (!resolved.ok) {
      return { ok: false, message: resolved.message, subscriptionsUrl };
    }

    const { stripeCustomerId, subscription } = resolved;

    if (!subscription.collectionPaused && subscription.status !== 'paused') {
      return {
        ok: true,
        message: `${subscription.productName} is not paused.`,
        subscriptionId: subscription.id,
        productName: subscription.productName,
        subscriptionsUrl,
      };
    }

    await resumeCustomerSubscription({
      stripeCustomerId,
      subscriptionId: subscription.id,
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      ok: true,
      message: `Resumed ${subscription.productName}. Billing/collection is active again.`,
      subscriptionId: subscription.id,
      productName: subscription.productName,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to resume subscription.',
      subscriptionId,
      subscriptionsUrl,
    };
  }
}

export async function toolSkipSubscriptionDelivery({
  subscriptionId,
  confirmed,
}: {
  subscriptionId: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();

  if (!confirmed) {
    return {
      ok: false,
      message:
        'Skip not run. Confirm which subscription / next delivery to skip, then call again with confirmed=true.',
      subscriptionsUrl,
    };
  }

  try {
    const resolved = await resolveOwnedSubscription(subscriptionId);

    if (!resolved.ok) {
      return { ok: false, message: resolved.message, subscriptionsUrl };
    }

    const { stripeCustomerId, subscription } = resolved;
    const result = await skipSubscriptionDelivery({
      subscriptionId: subscription.id,
      stripeCustomerId,
    });

    if (!result.ok) {
      return {
        ok: false,
        message:
          result.reason === 'not_found'
            ? 'Subscription not found.'
            : 'Unable to skip delivery for this subscription right now.',
        subscriptionId: subscription.id,
        productName: subscription.productName,
        subscriptionsUrl,
      };
    }

    await syncSubscriptionShipmentsForAccount();
    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      ok: true,
      message: `Skipped the next delivery for ${subscription.productName}. The billing cycle moved forward so they will not be charged for the skipped shipment.`,
      subscriptionId: subscription.id,
      productName: subscription.productName,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to skip delivery.',
      subscriptionId,
      subscriptionsUrl,
    };
  }
}

export async function toolUpdateSubscriptionFrequency({
  subscriptionId,
  intervalKey,
  confirmed,
}: {
  subscriptionId: string;
  intervalKey: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();
  const allowedFrequencies = getAllowedFrequencyOptions();
  const key = intervalKey.trim();

  if (!confirmed) {
    return {
      ok: false,
      message:
        'Frequency change not run. Confirm the subscription and new frequency with the customer, then call again with confirmed=true.',
      allowedFrequencies,
      subscriptionsUrl,
    };
  }

  if (!key) {
    return {
      ok: false,
      message: 'intervalKey is required (e.g. week:1, month:1). Use allowedFrequencies from list_subscriptions.',
      allowedFrequencies,
      subscriptionsUrl,
    };
  }

  try {
    const resolved = await resolveOwnedSubscription(subscriptionId);

    if (!resolved.ok) {
      return { ok: false, message: resolved.message, allowedFrequencies, subscriptionsUrl };
    }

    const { stripeCustomerId, subscription } = resolved;
    const previousFrequency = formatFrequencyLabel(subscription.interval, subscription.intervalCount);

    await updateSubscriptionFrequency({
      stripeCustomerId,
      subscriptionId: subscription.id,
      intervalKey: key,
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    const matched = allowedFrequencies.find((option) => option.intervalKey === key);

    return {
      ok: true,
      message: `Updated delivery frequency for ${subscription.productName} from ${previousFrequency} to ${matched?.label ?? key}.`,
      subscriptionId: subscription.id,
      productName: subscription.productName,
      previousFrequency,
      newIntervalKey: key,
      newFrequency: matched?.label ?? key,
      allowedFrequencies,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to update frequency.',
      subscriptionId,
      allowedFrequencies,
      subscriptionsUrl,
    };
  }
}

function addressesPageUrl() {
  return `${getAppBaseUrl()}/account/addresses`;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed || undefined;
}

export async function toolListShippingAddresses() {
  const addressesUrl = addressesPageUrl();
  const subscriptionsUrl = subscriptionsPageUrl();

  try {
    const data = await getCustomerAddresses({ limit: 50 });

    if (!data) {
      return {
        ok: false,
        message: 'Could not load saved addresses.',
        addresses: [] as Array<Record<string, string>>,
        addressesUrl,
        subscriptionsUrl,
      };
    }

    const addresses = data.addresses.map((address) => {
      const snapshot = customerAddressToSnapshot(address);

      return {
        addressId: String(address.entityId),
        label: formatShippingAddressLabel(snapshot),
        firstName: address.firstName,
        lastName: address.lastName,
        address1: address.address1,
        address2: address.address2 ?? '',
        city: address.city,
        stateOrProvince: address.stateOrProvince ?? '',
        countryCode: address.countryCode,
        postalCode: address.postalCode ?? '',
        phone: address.phone ?? '',
        company: address.company ?? '',
      };
    });

    return {
      ok: true,
      message:
        addresses.length === 0
          ? 'No saved shipping addresses on this account yet.'
          : `Found ${addresses.length} saved address(es).`,
      addresses,
      addressesUrl,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not load addresses.',
      addresses: [] as Array<Record<string, string>>,
      addressesUrl,
      subscriptionsUrl,
    };
  }
}

export async function toolUpdateSubscriptionShippingAddress({
  subscriptionId,
  addressId,
  confirmed,
}: {
  subscriptionId: string;
  addressId: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();
  const addressesUrl = addressesPageUrl();
  const selectedAddressId = addressId.trim();

  if (!confirmed) {
    return {
      ok: false,
      message:
        'Address change not run. Confirm the subscription and which saved address to use, then call again with confirmed=true.',
      subscriptionsUrl,
      addressesUrl,
    };
  }

  if (!selectedAddressId) {
    return {
      ok: false,
      message: 'addressId is required. Use list_shipping_addresses first.',
      subscriptionsUrl,
      addressesUrl,
    };
  }

  try {
    const resolved = await resolveOwnedSubscription(subscriptionId);

    if (!resolved.ok) {
      return { ok: false, message: resolved.message, subscriptionsUrl, addressesUrl };
    }

    const addressData = await getCustomerAddresses({ limit: 50 });
    const address = addressData?.addresses.find(
      (entry) => String(entry.entityId) === selectedAddressId,
    );

    if (!address) {
      return {
        ok: false,
        message: 'Address not found on this account. Use list_shipping_addresses first.',
        subscriptionsUrl,
        addressesUrl,
      };
    }

    const snapshot = customerAddressToSnapshot(address);

    await updateSubscriptionShippingAddress({
      stripeCustomerId: resolved.stripeCustomerId,
      subscriptionId: resolved.subscription.id,
      shippingAddress: snapshot,
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    const label = formatShippingAddressLabel(snapshot);

    return {
      ok: true,
      message: `Updated shipping address for ${resolved.subscription.productName} to ${label}.`,
      subscriptionId: resolved.subscription.id,
      productName: resolved.subscription.productName,
      addressId: selectedAddressId,
      shippingAddress: label,
      subscriptionsUrl,
      addressesUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to update shipping address.',
      subscriptionId,
      addressId: selectedAddressId,
      subscriptionsUrl,
      addressesUrl,
    };
  }
}

export async function toolAddShippingAddress({
  address,
  subscriptionId,
  confirmed,
}: {
  address: SaveCheckoutAddressInput;
  subscriptionId?: string;
  confirmed: boolean;
}) {
  const subscriptionsUrl = subscriptionsPageUrl();
  const addressesUrl = addressesPageUrl();

  if (!confirmed) {
    return {
      ok: false,
      message:
        'Address not saved. Collect the full address, read it back for confirmation, then call again with confirmed=true.',
      subscriptionsUrl,
      addressesUrl,
    };
  }

  const required = [
    address.firstName,
    address.lastName,
    address.address1,
    address.city,
    address.countryCode,
  ];

  if (required.some((value) => !value?.trim())) {
    return {
      ok: false,
      message:
        'Missing required fields. Need firstName, lastName, address1, city, and countryCode (e.g. CA or US).',
      subscriptionsUrl,
      addressesUrl,
    };
  }

  try {
    const saveResult = await saveCheckoutAddress({
      firstName: address.firstName.trim(),
      lastName: address.lastName.trim(),
      address1: address.address1.trim(),
      address2: optionalString(address.address2),
      city: address.city.trim(),
      company: optionalString(address.company),
      countryCode: address.countryCode.trim().toUpperCase(),
      stateOrProvince: optionalString(address.stateOrProvince),
      phone: optionalString(address.phone),
      postalCode: optionalString(address.postalCode),
    });

    if (!saveResult.success) {
      return {
        ok: false,
        message: saveResult.error,
        subscriptionsUrl,
        addressesUrl,
      };
    }

    const saved = saveResult.address;
    const label = formatShippingAddressLabel({
      firstName: saved.firstName,
      lastName: saved.lastName,
      email: '',
      address1: saved.address1,
      address2: saved.address2,
      city: saved.city,
      stateOrProvince: saved.stateOrProvince,
      countryCode: saved.countryCode,
      postalCode: saved.postalCode ?? '',
      phone: saved.phone,
      company: saved.company,
    });

    const applyTo = subscriptionId?.trim();

    if (!applyTo) {
      return {
        ok: true,
        message: `Saved new address (${label}). Provide a subscriptionId to apply it to a subscription, or use update_subscription_shipping_address.`,
        addressId: saved.id,
        shippingAddress: label,
        appliedToSubscription: false,
        subscriptionsUrl,
        addressesUrl,
      };
    }

    const resolved = await resolveOwnedSubscription(applyTo);

    if (!resolved.ok) {
      return {
        ok: true,
        message: `Saved new address (${label}), but could not apply it to a subscription: ${resolved.message}`,
        addressId: saved.id,
        shippingAddress: label,
        appliedToSubscription: false,
        subscriptionsUrl,
        addressesUrl,
      };
    }

    await updateSubscriptionShippingAddress({
      stripeCustomerId: resolved.stripeCustomerId,
      subscriptionId: resolved.subscription.id,
      shippingAddress: {
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: '',
        address1: saved.address1,
        address2: saved.address2,
        city: saved.city,
        stateOrProvince: saved.stateOrProvince,
        countryCode: saved.countryCode,
        postalCode: saved.postalCode ?? '',
        phone: saved.phone,
        company: saved.company,
      },
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      ok: true,
      message: `Saved new address and applied it to ${resolved.subscription.productName}: ${label}.`,
      addressId: saved.id,
      shippingAddress: label,
      appliedToSubscription: true,
      subscriptionId: resolved.subscription.id,
      productName: resolved.subscription.productName,
      subscriptionsUrl,
      addressesUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to save shipping address.',
      subscriptionsUrl,
      addressesUrl,
    };
  }
}

export const VIRTUAL_CARE_BOT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_products',
      description:
        'Search the store catalog for products by name or keyword. Returns productEntityId, stock, price, and product page links. Always search before add_to_cart.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Product search term, e.g. "alcohol swabs"' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_to_cart',
      description:
        'Add a catalog product to the signed-in customer cart. Requires productEntityId from search_products or get_purchase_stats. Confirm product and quantity with the customer first when ambiguous. Does NOT place an order or charge payment.',
      parameters: {
        type: 'object',
        properties: {
          productEntityId: {
            type: 'number',
            description: 'BigCommerce product entity id from search or purchase stats',
          },
          quantity: {
            type: 'number',
            description: 'Quantity to add (default 1, max 50)',
          },
        },
        required: ['productEntityId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_recent_orders',
      description:
        'Get this signed-in customer recent orders with status and links. The customer is always authenticated in this chat. Empty orders means they have no orders — not that they are logged out.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max orders to return (default 3)' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_purchase_stats',
      description:
        'Analyze recent order history for top purchased products (quantity and times ordered), including the number-one item. Use for questions like "what do I buy most?" or reorder suggestions.',
      parameters: {
        type: 'object',
        properties: {
          orderLimit: {
            type: 'number',
            description: 'How many recent orders to analyze (default 25, max 50)',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_prescription_status',
      description:
        'Get prescription and refill request status for the logged-in customer. Operational status only — not clinical advice.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_subscriptions',
      description:
        'List this customer Stripe subscriptions (product, status, frequency, pause/skip/cancel flags) and allowed frequency options. Always use before managing a subscription.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cancel_subscription',
      description:
        'Cancel one of the customer subscriptions immediately via Stripe. ALWAYS list_subscriptions first, name the product clearly, and get an explicit yes in the conversation before calling with confirmed=true. Requires a short cancellationReason.',
      parameters: {
        type: 'object',
        properties: {
          subscriptionId: {
            type: 'string',
            description: 'Stripe subscription id from list_subscriptions (e.g. sub_...)',
          },
          cancellationReason: {
            type: 'string',
            description: 'Short reason from the customer (e.g. "too expensive", "no longer needed")',
          },
          confirmed: {
            type: 'boolean',
            description: 'Must be true only after the customer explicitly confirmed cancellation in chat',
          },
        },
        required: ['subscriptionId', 'cancellationReason', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'pause_subscription',
      description:
        'Pause billing/collection for a subscription (keeps it, stops charging). Confirm in chat first, then call with confirmed=true.',
      parameters: {
        type: 'object',
        properties: {
          subscriptionId: { type: 'string' },
          confirmed: { type: 'boolean' },
        },
        required: ['subscriptionId', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'resume_subscription',
      description:
        'Resume a paused subscription. Confirm in chat first, then call with confirmed=true.',
      parameters: {
        type: 'object',
        properties: {
          subscriptionId: { type: 'string' },
          confirmed: { type: 'boolean' },
        },
        required: ['subscriptionId', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'skip_subscription_delivery',
      description:
        'Skip the next delivery / billing cycle for a subscription (no charge for the skipped shipment). Confirm in chat first, then call with confirmed=true.',
      parameters: {
        type: 'object',
        properties: {
          subscriptionId: { type: 'string' },
          confirmed: { type: 'boolean' },
        },
        required: ['subscriptionId', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_subscription_frequency',
      description:
        'Change delivery frequency. intervalKey must be one of allowedFrequencies from list_subscriptions (e.g. week:1, month:1). Confirm the new frequency in chat first, then call with confirmed=true.',
      parameters: {
        type: 'object',
        properties: {
          subscriptionId: { type: 'string' },
          intervalKey: {
            type: 'string',
            description: 'Frequency key like week:1 or month:1 from allowedFrequencies',
          },
          confirmed: { type: 'boolean' },
        },
        required: ['subscriptionId', 'intervalKey', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_shipping_addresses',
      description:
        'List saved customer shipping addresses (addressId + full label). Use before switching a subscription to an existing address.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_subscription_shipping_address',
      description:
        'Apply an existing saved address to a subscription. Use addressId from list_shipping_addresses. Confirm in chat first, then call with confirmed=true.',
      parameters: {
        type: 'object',
        properties: {
          subscriptionId: { type: 'string' },
          addressId: {
            type: 'string',
            description: 'Saved address id from list_shipping_addresses',
          },
          confirmed: { type: 'boolean' },
        },
        required: ['subscriptionId', 'addressId', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_shipping_address',
      description:
        'Save a new shipping address to the customer account. Optionally set subscriptionId to also apply it to that subscription. Collect all required fields, read the address back for confirmation, then call with confirmed=true. Required: firstName, lastName, address1, city, countryCode.',
      parameters: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          address1: { type: 'string' },
          address2: { type: 'string' },
          city: { type: 'string' },
          stateOrProvince: {
            type: 'string',
            description: 'Province/state name or code (e.g. Ontario or ON)',
          },
          countryCode: {
            type: 'string',
            description: 'ISO country code, e.g. CA or US',
          },
          postalCode: { type: 'string' },
          phone: { type: 'string' },
          company: { type: 'string' },
          subscriptionId: {
            type: 'string',
            description: 'Optional — if set, also apply this new address to that subscription',
          },
          confirmed: { type: 'boolean' },
        },
        required: ['firstName', 'lastName', 'address1', 'city', 'countryCode', 'confirmed'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_help_topics',
      description: 'Get curated how-to guides and account page links for the Liivv store.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
] as const;

export async function executeVirtualCareBotTool(
  name: string,
  args: Record<string, unknown>,
  profileId: string,
): Promise<unknown> {
  switch (name) {
    case 'search_products':
      return toolSearchProducts(String(args.query ?? ''));
    case 'add_to_cart':
      return toolAddToCart(
        Number(args.productEntityId),
        typeof args.quantity === 'number' ? args.quantity : 1,
      );
    case 'get_recent_orders':
      return toolGetRecentOrders(typeof args.limit === 'number' ? args.limit : 3);
    case 'get_purchase_stats':
      return toolGetPurchaseStats(typeof args.orderLimit === 'number' ? args.orderLimit : 25);
    case 'get_prescription_status':
      return toolGetPrescriptionStatus(profileId);
    case 'list_subscriptions':
      return toolListSubscriptions();
    case 'cancel_subscription':
      return toolCancelSubscription({
        subscriptionId: String(args.subscriptionId ?? ''),
        cancellationReason: String(args.cancellationReason ?? ''),
        confirmed: args.confirmed === true,
      });
    case 'pause_subscription':
      return toolPauseSubscription({
        subscriptionId: String(args.subscriptionId ?? ''),
        confirmed: args.confirmed === true,
      });
    case 'resume_subscription':
      return toolResumeSubscription({
        subscriptionId: String(args.subscriptionId ?? ''),
        confirmed: args.confirmed === true,
      });
    case 'skip_subscription_delivery':
      return toolSkipSubscriptionDelivery({
        subscriptionId: String(args.subscriptionId ?? ''),
        confirmed: args.confirmed === true,
      });
    case 'update_subscription_frequency':
      return toolUpdateSubscriptionFrequency({
        subscriptionId: String(args.subscriptionId ?? ''),
        intervalKey: String(args.intervalKey ?? ''),
        confirmed: args.confirmed === true,
      });
    case 'list_shipping_addresses':
      return toolListShippingAddresses();
    case 'update_subscription_shipping_address':
      return toolUpdateSubscriptionShippingAddress({
        subscriptionId: String(args.subscriptionId ?? ''),
        addressId: String(args.addressId ?? ''),
        confirmed: args.confirmed === true,
      });
    case 'add_shipping_address':
      return toolAddShippingAddress({
        address: {
          firstName: String(args.firstName ?? ''),
          lastName: String(args.lastName ?? ''),
          address1: String(args.address1 ?? ''),
          address2: optionalString(args.address2),
          city: String(args.city ?? ''),
          company: optionalString(args.company),
          countryCode: String(args.countryCode ?? ''),
          stateOrProvince: optionalString(args.stateOrProvince),
          phone: optionalString(args.phone),
          postalCode: optionalString(args.postalCode),
        },
        subscriptionId: optionalString(args.subscriptionId),
        confirmed: args.confirmed === true,
      });
    case 'get_help_topics':
      return toolGetHelpTopics();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
