'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { useAnalytics } from '~/lib/analytics/react';
import { isSensitiveProduct } from '~/lib/analytics/sensitive-products';

import { getCategoryPageData } from '../page-data';

type Category = Awaited<ReturnType<typeof getCategoryPageData>>['category'];
type productSearchItem = FragmentOf<typeof ProductCardFragment>;

interface Props {
  category: NonNullable<Category>;
  /**
   * This shelf's own category id and every ancestor above it, from the page
   * that renders the same answer into its ad-signal flag. Sensitivity follows
   * the tree: a shelf under "Ostomy Care" is an ostomy shelf.
   */
  categoryIds: readonly number[];
  products: productSearchItem[];
  /**
   * The ids on this shelf the catalogue says may not be named, resolved on the
   * server by `getSensitiveProductIds`. It fails closed, so a lookup that could
   * not be answered arrives here as every id on the page.
   */
  sensitiveProductIds: readonly number[];
}

export const CategoryViewed = ({
  category,
  categoryIds,
  products,
  sensitiveProductIds,
}: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    /*
     * An ostomy shelf reveals something about the person browsing it, so
     * neither the list nor anything on it is reported — and "an ostomy shelf"
     * means this shelf or any shelf under it, which is why the ids arrive as
     * a whole breadcrumb trail rather than one entityId. On every other shelf
     * the products are checked one by one, which catches both a curated
     * ostomy kit shown on a general shelf and an item that is an ostomy
     * product by a category this page is not — a skin barrier wipe listed
     * under wound care and under ostomy skin care. The second of those is the
     * server lookup's answer, since a product card carries no categories.
     */
    const sensitiveList = isSensitiveProduct({ categoryIds });
    const sensitiveIds = new Set(sensitiveProductIds);

    analytics?.navigation.categoryViewed({
      id: category.entityId,
      name: category.name,
      sensitive: sensitiveList,
      currency: products[0]?.prices?.price.currencyCode || 'USD',
      items: products.map((p) => {
        return {
          id: p.entityId.toString(),
          name: p.name,
          brand: p.brand?.name,
          price: p.prices?.price.value,
          categories: removeEdgesAndNodes(category.breadcrumbs).map(({ name }) => name),
          sensitive:
            sensitiveList ||
            sensitiveIds.has(p.entityId) ||
            isSensitiveProduct({ entityId: p.entityId }),
        };
      }),
    });
  }, [analytics, category, categoryIds, products, sensitiveProductIds]);

  return null;
};
