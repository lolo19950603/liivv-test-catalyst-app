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
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');
  const tAccount = await getTranslations('Account.Layout');
  const tDashboard = await getTranslations('Account.Dashboard');

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

  const loggedIn = await isLoggedIn();
  const accountHref = resolveAccountHref(loggedIn);
  const customer = loggedIn ? await getDashboardCustomer() : null;
  const accountMenuLinks = loggedIn ? buildAccountMenuLinks((key) => tAccount(key)) : undefined;
  const firstName = customer?.firstName.trim() ?? '';
  const lastName = customer?.lastName.trim() ?? '';
  const accountCustomerName =
    loggedIn && customer
      ? [firstName, lastName].filter(Boolean).join(' ') || tDashboard('guestName')
      : undefined;
  const accountLabel = loggedIn ? tDashboard('myAccount') : undefined;
  const accountNotifications = loggedIn
    ? await getAccountDashboardNotifications(locale)
    : null;
  const notifications = accountNotifications
    ? {
        items: accountNotifications.headerNotifications,
        unreadCount: accountNotifications.unreadCount,
        labels: {
          ariaLabel: tDashboard('notifications'),
          panelTitle: tDashboard('notificationsPanelTitle'),
          empty: tDashboard('notificationsEmpty'),
          kindOrder: tDashboard('notificationKindOrder'),
          kindSubscription: tDashboard('notificationKindSubscription'),
        },
      }
    : null;
  const requestPathname = stripLocaleFromPathname((await headers()).get('x-pathname') ?? '/');

  return (
    <SiteHeader
      accountCustomerName={accountCustomerName}
      accountHref={accountHref}
      accountLabel={accountLabel}
      accountMenuLinks={accountMenuLinks}
      cartCount={streamableCartCount}
      categoryTree={streamableCategoryTree}
      initialPathname={requestPathname}
      notifications={notifications}
      storeLogo={logo}
      storeLogoLabel={t('home')}
      searchPlaceholder={t('Search.inputPlaceholder')}
    />
  );
};
