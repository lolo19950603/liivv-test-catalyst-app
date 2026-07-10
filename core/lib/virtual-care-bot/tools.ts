import 'server-only';

import { getSearchResults } from '~/client/queries/get-search-results';
import { getCustomerOrders } from '~/app/[locale]/(default)/account/(portal)/orders/page-data';
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
      name: product.name,
      path: product.path ? `${base}${product.path}` : '',
      price: formatMoney(price, currency),
      stock: stockLabel({ inventory: product.inventory }),
    };
  });

  return { products };
}

export async function toolGetRecentOrders(limit = 3) {
  const data = await getCustomerOrders({ limit });

  if (!data?.orders?.length) {
    return {
      orders: [] as Array<Record<string, string>>,
      ordersPageUrl: `${getAppBaseUrl()}/account/orders`,
    };
  }

  const base = getAppBaseUrl();

  const orders = data.orders.map((order) => ({
    orderNumber: String(order.entityId),
    status: order.status?.label ?? 'Unknown',
    orderedAt: order.orderedAt?.utc ?? '',
    total: formatMoney(order.totalIncTax?.value, order.totalIncTax?.currencyCode),
    url: `${base}/account/orders/${order.entityId}`,
  }));

  return { orders, ordersPageUrl: `${base}/account/orders` };
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

export const VIRTUAL_CARE_BOT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_products',
      description:
        'Search the store catalog for products by name or keyword. Use for stock, price, and product page links.',
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
      name: 'get_recent_orders',
      description:
        'Get the logged-in customer recent orders with status and links. Only works for authenticated customers.',
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
    case 'get_recent_orders':
      return toolGetRecentOrders(typeof args.limit === 'number' ? args.limit : 3);
    case 'get_prescription_status':
      return toolGetPrescriptionStatus(profileId);
    case 'get_help_topics':
      return toolGetHelpTopics();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
