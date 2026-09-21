'use client';

import { useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { useAnalytics } from '~/lib/analytics/react';

import {
  CartGiftCertificateFragment,
  DigitalItemFragment,
  PhysicalItemFragment,
} from '../page-data';

type PhysicalItem = FragmentOf<typeof PhysicalItemFragment>;
type DigitalItem = FragmentOf<typeof DigitalItemFragment>;
type GiftCertificateItem = FragmentOf<typeof CartGiftCertificateFragment>;
type LineItem = PhysicalItem | DigitalItem | GiftCertificateItem;

interface Props {
  subtotal?: number;
  currencyCode: string;
  lineItems: LineItem[];
  /**
   * Product ids in this cart that an analytics event may not name. Worked out
   * on the server, because a cart line item carries no categories.
   *
   * Required, like the category page's: a mount that left it out would quietly
   * name every line in the cart, and the compiler is a better guard against
   * that than a reviewer. `getSensitiveProductIds` already fails closed, so a
   * lookup that could not be answered arrives here as every id in the cart.
   */
  sensitiveProductIds: readonly number[];
}

export const CartViewed = ({ subtotal, currencyCode, lineItems, sensitiveProductIds }: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    const sensitive = new Set(sensitiveProductIds);

    analytics?.cart.cartViewed({
      currency: currencyCode,
      value: subtotal ?? 0,
      items: lineItems.map((lineItem) => {
        if (lineItem.__typename === 'CartGiftCertificate') {
          return {
            id: lineItem.entityId.toString(),
            name: lineItem.name,
            price: lineItem.amount.value,
            quantity: 1,
          };
        }

        return {
          id: lineItem.productEntityId.toString(),
          name: lineItem.name,
          brand: lineItem.brand ?? undefined,
          sku: lineItem.sku ?? undefined,
          price: lineItem.listPrice.value,
          variant_id: lineItem.variantEntityId ?? undefined,
          quantity: lineItem.quantity,
          sensitive: sensitive.has(lineItem.productEntityId),
        };
      }),
    });
  }, [analytics, currencyCode, lineItems, sensitiveProductIds, subtotal]);

  return null;
};
