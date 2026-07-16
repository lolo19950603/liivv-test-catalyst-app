import 'server-only';

import { revalidateTag } from 'next/cache';

import { getSearchResults } from '~/client/queries/get-search-results';
import { getCustomerOrders } from '~/app/[locale]/(default)/account/(portal)/orders/page-data';
import { resolveStripeCustomerIdForAccount } from '~/app/[locale]/(default)/account/(portal)/subscriptions/page-data';
import { TAGS } from '~/client/tags';
import { addToOrCreateCart } from '~/lib/cart';
import { isStripeConfigured } from '~/lib/stripe/client';
import {
  cancelCustomerSubscription,
  getCustomerSubscriptions,
} from '~/lib/stripe/subscriptions';
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

function formatUnixDate(seconds: number): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      dateStyle: 'medium',
    }).format(new Date(seconds * 1000));
  } catch {
    return '';
  }
}

export async function toolListSubscriptions() {
  const base = getAppBaseUrl();
  const subscriptionsUrl = `${base}/account/subscriptions`;

  if (!isStripeConfigured()) {
    return {
      ok: false,
      message: 'Subscriptions are not available right now.',
      subscriptions: [] as Array<Record<string, string>>,
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
        subscriptionsUrl,
      };
    }

    const subscriptions = await getCustomerSubscriptions(stripeCustomerId);
    const mapped = subscriptions.map((sub) => {
      const canCancel = CANCELABLE_SUBSCRIPTION_STATUSES.has(sub.status) && !sub.cancelAtPeriodEnd;

      return {
        subscriptionId: sub.id,
        productName: sub.productName,
        variant: sub.variantSubtitle ?? '',
        status: sub.status,
        quantity: String(sub.quantity),
        frequency: `every ${sub.intervalCount} ${sub.interval}${sub.intervalCount === 1 ? '' : 's'}`,
        nextBillingDate: formatUnixDate(sub.currentPeriodEnd),
        cancelScheduled: sub.cancelAtPeriodEnd ? 'yes' : 'no',
        canCancel: canCancel ? 'yes' : 'no',
        amount:
          sub.totalIncTaxCents != null
            ? formatMoney(sub.totalIncTaxCents / 100, sub.currency.toUpperCase())
            : '',
      };
    });

    const cancelableCount = mapped.filter((s) => s.canCancel === 'yes').length;

    return {
      ok: true,
      message:
        mapped.length === 0
          ? 'This customer has no subscriptions on file.'
          : `Found ${mapped.length} subscription(s); ${cancelableCount} can be cancelled.`,
      subscriptions: mapped,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not load subscriptions.',
      subscriptions: [] as Array<Record<string, string>>,
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
  const base = getAppBaseUrl();
  const subscriptionsUrl = `${base}/account/subscriptions`;
  const id = subscriptionId.trim();
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

  if (!id || !reason) {
    return {
      ok: false,
      cancelled: false,
      message: 'subscriptionId and cancellationReason are required.',
      subscriptionsUrl,
    };
  }

  if (!isStripeConfigured()) {
    return {
      ok: false,
      cancelled: false,
      message: 'Subscriptions are not available right now.',
      subscriptionsUrl,
    };
  }

  try {
    const stripeCustomerId = await resolveStripeCustomerIdForAccount();

    if (!stripeCustomerId) {
      return {
        ok: false,
        cancelled: false,
        message: 'No Stripe customer found for this account.',
        subscriptionsUrl,
      };
    }

    const subscriptions = await getCustomerSubscriptions(stripeCustomerId);
    const match = subscriptions.find((sub) => sub.id === id);

    if (!match) {
      return {
        ok: false,
        cancelled: false,
        message: 'That subscription was not found on this account. Use list_subscriptions first.',
        subscriptionsUrl,
      };
    }

    if (!CANCELABLE_SUBSCRIPTION_STATUSES.has(match.status)) {
      return {
        ok: false,
        cancelled: false,
        message: `This subscription cannot be cancelled (status: ${match.status}).`,
        subscriptionId: id,
        productName: match.productName,
        subscriptionsUrl,
      };
    }

    await cancelCustomerSubscription({
      stripeCustomerId,
      subscriptionId: id,
      cancellationReason: reason,
    });
    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      ok: true,
      cancelled: true,
      message: `Cancelled subscription for ${match.productName}. Billing will stop; link them to Subscriptions if they want to review or reactivate.`,
      subscriptionId: id,
      productName: match.productName,
      cancellationReason: reason,
      subscriptionsUrl,
    };
  } catch (error) {
    return {
      ok: false,
      cancelled: false,
      message: error instanceof Error ? error.message : 'Unable to cancel subscription.',
      subscriptionId: id,
      subscriptionsUrl,
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
        'List this customer Stripe subscriptions (product, status, frequency, whether cancelable). Use before cancelling or when they ask about active subscriptions.',
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
    case 'get_help_topics':
      return toolGetHelpTopics();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
