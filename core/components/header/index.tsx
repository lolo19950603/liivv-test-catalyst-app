import { getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { GetLinksAndSectionsQuery, LayoutQuery } from '~/app/[locale]/(default)/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { getCartId } from '~/lib/cart';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { SiteHeader } from '~/lib/makeswift/components/site-header';
import { mapCategoryTreeFromStore } from '~/lib/makeswift/site-header/map-category-tree';

import { CurrencyCode, HeaderFragment, HeaderLinksFragment } from './fragment';

const GetCartCountQuery = graphql(`
  query GetCartCountQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
        entityId
        lineItems {
          totalQuantity
        }
      }
    }
  }
`);

const getCartCount = cache(async (cartId: string, customerAccessToken?: string) => {
  const response = await client.fetch({
    document: GetCartCountQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart],
      },
    },
  });

  return response.data.site.cart?.lineItems.totalQuantity ?? null;
});

const getHeaderLinks = cache(async (customerAccessToken?: string, currencyCode?: CurrencyCode) => {
  const { data: response } = await client.fetch({
    document: GetLinksAndSectionsQuery,
    customerAccessToken,
    variables: { currencyCode },
    validateCustomerAccessToken: false,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return readFragment(HeaderLinksFragment, response).site;
});

const getHeaderData = cache(async () => {
  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: { next: { revalidate } },
  });

  return readFragment(HeaderFragment, response).site;
});

export const Header = async () => {
  const t = await getTranslations('Components.Header');

  const data = await getHeaderData();
  const logo = data.settings ? logoTransformer(data.settings) : '';

  const streamableCategoryTree = Streamable.from(async () => {
    const [customerAccessToken, currencyCode] = await Promise.all([
      getSessionCustomerAccessToken(),
      getPreferredCurrencyCode(),
    ]);

    const { categoryTree } = await getHeaderLinks(customerAccessToken, currencyCode);

    return mapCategoryTreeFromStore(categoryTree);
  });

  const streamableCartCount = Streamable.from(async () => {
    const cartId = await getCartId();
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!cartId) {
      return null;
    }

    return getCartCount(cartId, customerAccessToken);
  });

  return (
    <SiteHeader
      cartCount={streamableCartCount}
      categoryTree={streamableCategoryTree}
      storeLogo={logo}
      storeLogoLabel={t('home')}
      searchPlaceholder={t('Search.inputPlaceholder')}
    />
  );
};
