import { getLocale, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { GetLinksAndSectionsQuery, LayoutQuery } from '~/app/[locale]/(default)/page-data';
import { getSessionCustomerAccessToken, isLoggedIn } from '~/auth';
import { client } from '~/client';
import { graphql, readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { getCartId } from '~/lib/cart';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getDashboardCustomer } from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { buildAccountMenuLinks } from '~/lib/account/account-menu-links';
import { getAccountDashboardNotifications } from '~/lib/account-notifications/get-header-notifications';
import type { SiteHeaderNotifications } from '~/lib/account-notifications/header-notification-labels';
import { SiteHeader } from '~/lib/makeswift/components/site-header';
import { resolveAccountHref } from '~/lib/makeswift/site-header/resolve-account-href';
import { mapCategoryTreeFromStore } from '~/lib/makeswift/site-header/map-category-tree';
import { stripLocaleFromPathname } from '~/lib/makeswift/site-header/should-hide-store-header';

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
  const [locale, t, tAccount, tDashboard, data, loggedIn, requestHeaders] = await Promise.all([
    getLocale(),
    getTranslations('Components.Header'),
    getTranslations('Account.Layout'),
    getTranslations('Account.Dashboard'),
    getHeaderData(),
    isLoggedIn(),
    headers(),
  ]);

  const logo = data.settings ? logoTransformer(data.settings) : '';
  const requestPathname = stripLocaleFromPathname(requestHeaders.get('x-pathname') ?? '/');
  const accountHref = resolveAccountHref(loggedIn);
  const accountMenuLinks = loggedIn ? buildAccountMenuLinks((key) => tAccount(key)) : undefined;

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

  const streamableAccountCustomerName = Streamable.from(async () => {
    if (!loggedIn) {
      return undefined;
    }

    const customer = await getDashboardCustomer();

    if (!customer) {
      return undefined;
    }

    const firstName = customer.firstName.trim();
    const lastName = customer.lastName.trim();

    return [firstName, lastName].filter(Boolean).join(' ') || tDashboard('guestName');
  });

  const streamableNotifications = Streamable.from(async (): Promise<SiteHeaderNotifications | null> => {
    if (!loggedIn) {
      return null;
    }

    try {
      const accountNotifications = await getAccountDashboardNotifications(locale);

      return {
        items: accountNotifications.headerNotifications,
        unreadCount: accountNotifications.unreadCount,
        labels: {
          ariaLabel: tDashboard('notifications'),
          panelTitle: tDashboard('notificationsPanelTitle'),
          empty: tDashboard('notificationsEmpty'),
          kindOrder: tDashboard('notificationKindOrder'),
          kindSubscription: tDashboard('notificationKindSubscription'),
        },
      };
    } catch (error) {
      console.error('[header] account notifications', error);

      return null;
    }
  });

  return (
    <SiteHeader
      accountCustomerName={streamableAccountCustomerName}
      accountHref={accountHref}
      accountLabel={loggedIn ? tDashboard('myAccount') : undefined}
      accountMenuLinks={accountMenuLinks}
      cartCount={streamableCartCount}
      categoryTree={streamableCategoryTree}
      initialPathname={requestPathname}
      notifications={streamableNotifications}
      storeLogo={logo}
      storeLogoLabel={t('home')}
      searchPlaceholder={t('Search.inputPlaceholder')}
    />
  );
};
