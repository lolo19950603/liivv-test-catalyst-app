import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

import {
  getSubscriptionLinesForCartLine,
  getTotalSubscriptionQuantityForCartLine,
  mergeSubscriptionLinesByIdentity,
  subscriptionLineIdentityKey,
} from './subscription-line-key';
import type { SubscriptionLineMeta } from './types';

export const SUBSCRIPTION_LINE_MARKER = ':sub:';
export const ONE_TIME_LINE_SUFFIX = ':one-time';

export type CartLinePurchaseType = 'subscription' | 'one-time';

export function buildSubscriptionLineId(
  lineItemEntityId: string,
  identityKey: string,
): string {
  return `${lineItemEntityId}${SUBSCRIPTION_LINE_MARKER}${identityKey}`;
}

export function parseCartLineItemId(id: string): {
  lineItemEntityId: string;
  purchaseType: CartLinePurchaseType | null;
  subscriptionLineKey?: string;
} {
  const subscriptionMarkerIndex = id.indexOf(SUBSCRIPTION_LINE_MARKER);

  if (subscriptionMarkerIndex >= 0) {
    return {
      lineItemEntityId: id.slice(0, subscriptionMarkerIndex),
      purchaseType: 'subscription',
      subscriptionLineKey: id.slice(subscriptionMarkerIndex + SUBSCRIPTION_LINE_MARKER.length),
    };
  }

  if (id.endsWith(ONE_TIME_LINE_SUFFIX)) {
    return {
      lineItemEntityId: id.slice(0, -ONE_TIME_LINE_SUFFIX.length),
      purchaseType: 'one-time',
    };
  }

  return { lineItemEntityId: id, purchaseType: null };
}

/** @deprecated Use getTotalSubscriptionQuantityForCartLine instead */
export function getSubscriptionQuantityForProductOptions(
  lines: SubscriptionLineMeta[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): number {
  return getTotalSubscriptionQuantityForCartLine(lines, productEntityId, productOptions);
}

export function expandCartLineItemsBySubscription<
  T extends {
    id: string;
    quantity: number;
  },
>({
  item,
  subscriptionEntries,
  applySubscription,
}: {
  item: T;
  subscriptionEntries: SubscriptionLineMeta[];
  applySubscription: (item: T, entry: SubscriptionLineMeta) => Partial<T>;
}): Array<
  T & {
    id: string;
    quantity: number;
    lineItemEntityId: string;
    purchaseType?: CartLinePurchaseType;
    subscriptionLineKey?: string;
  }
> {
  const mergedSubscriptionEntries = mergeSubscriptionLinesByIdentity(subscriptionEntries);
  const totalSubscriptionQty = mergedSubscriptionEntries.reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );
  const oneTimeQty = Math.max(0, item.quantity - totalSubscriptionQty);

  const rows = mergedSubscriptionEntries.map((entry) => {
    const identityKey = subscriptionLineIdentityKey(entry);

    return {
      ...item,
      ...applySubscription(item, entry),
      id: buildSubscriptionLineId(item.id, identityKey),
      lineItemEntityId: item.id,
      subscriptionLineKey: identityKey,
      purchaseType: 'subscription' as const,
      quantity: entry.quantity,
    };
  });

  if (oneTimeQty > 0) {
    rows.push({
      ...item,
      id: `${item.id}${ONE_TIME_LINE_SUFFIX}`,
      lineItemEntityId: item.id,
      purchaseType: 'one-time',
      quantity: oneTimeQty,
    });
  }

  if (rows.length === 0) {
    return [
      {
        ...item,
        id: item.id,
        lineItemEntityId: item.id,
        quantity: item.quantity,
      },
    ];
  }

  return rows;
}

export function expandCartLineItemForProduct<
  T extends {
    id: string;
    quantity: number;
  },
>({
  item,
  subscriptionLines,
  productEntityId,
  productOptions,
  applySubscription,
}: {
  item: T;
  subscriptionLines: SubscriptionLineMeta[];
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  applySubscription: (item: T, entry: SubscriptionLineMeta) => Partial<T>;
}): ReturnType<typeof expandCartLineItemsBySubscription<T>> {
  return expandCartLineItemsBySubscription({
    item,
    subscriptionEntries: getSubscriptionLinesForCartLine(
      subscriptionLines,
      productEntityId,
      productOptions,
      item.id,
    ),
    applySubscription,
  });
}
