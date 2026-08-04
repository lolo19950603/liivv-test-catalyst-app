import 'server-only';

import { getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { getWellnessDashboardContext } from '~/app/[locale]/(default)/account/onboarding/page-data';
import {
  getDashboardCustomer,
} from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { buildDashboardLabels } from '~/lib/account-dashboard/dashboard-labels';
import { buildAccountMenuLinks } from '~/lib/account/account-menu-links';
import { getAccountDashboardNotifications } from '~/lib/account-notifications/get-header-notifications';
import { getCartId } from '~/lib/cart';
import { appendSetupFlowQuery } from '~/lib/onboarding/onboarding-flow';
import { getFirstIncompleteOnboardingHref } from '~/lib/supabase/onboarding-redirect';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { getStoreLogoFallback } from '~/lib/store-theme/get-store-logo-fallback';

import type { AccountMenuLink } from '~/lib/account/account-menu-links';
import type { AccountDashboardLabels } from '~/components/account-dashboard/types';
import type { AccountHeaderNotification } from '~/lib/account-notifications/types';

const GetCartCountQuery = graphql(`
  query GetDashboardCartCountQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
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

export interface AccountDashboardShellData {
  customerName: string;
  labels: AccountDashboardLabels;
  logoSrc: string;
  logoAlt: string;
  onboardingBannerHref: string | null;
  headerNotifications: AccountHeaderNotification[];
  notificationsUnreadCount: number;
  cartHref: string;
  cartCount: number | null;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  wishlistsHref: string;
  settingsHref: string;
  contactHref: string;
  logoutHref: string;
  searchPlaceholder: string;
  accountMenuLinks: AccountMenuLink[];
}

export async function getAccountDashboardShellProps(
  locale: string,
): Promise<AccountDashboardShellData | null> {
  const customer = await getDashboardCustomer();

  if (!customer) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: 'Account.Dashboard' });
  const tAccount = await getTranslations({ locale, namespace: 'Account.Layout' });
  const tSearch = await getTranslations({ locale, namespace: 'Components.Header.Search' });
  const [wellness, accountNotifications, storeLogo, cartId, customerAccessToken] =
    await Promise.all([
      getWellnessDashboardContext(),
      getAccountDashboardNotifications(locale),
      getStoreLogoFallback(),
      getCartId(),
      getSessionCustomerAccessToken(),
    ]);

  const cartCount = cartId ? await getCartCount(cartId, customerAccessToken) : null;

  const firstName = customer.firstName.trim();
  const lastName = customer.lastName.trim();
  const customerName = [firstName, lastName].filter(Boolean).join(' ') || t('guestName');
  const firstNameForGreeting = firstName.length > 0 ? firstName : customerName;
  const primaryCategoryId = wellness.primaryCategory?.id;

  const labels = buildDashboardLabels(
    t as (key: string, values?: Record<string, string>) => string,
    {
      customerFirstName: firstNameForGreeting,
      primaryCategoryId,
    },
  );

  let onboardingBannerHref: string | null = null;

  if (!wellness.onboardingComplete) {
    const ensured = await ensureCustomerProfile({
      entityId: customer.entityId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    });
    onboardingBannerHref = await getFirstIncompleteOnboardingHref(
      {
        entityId: customer.entityId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      ensured,
    );
    onboardingBannerHref = onboardingBannerHref
      ? appendSetupFlowQuery(onboardingBannerHref)
      : null;
  }

  const logoSrc =
    storeLogo?.src ??
    'https://storage.googleapis.com/s.mkswft.com/RmlsZTo4NWQ4MGJiNi03MDZjLTQ4MWEtOGFmNi1kNDI2ZjBlNDYwOTQ=/Liivv_Favicon.png';
  const logoAlt = storeLogo?.alt ?? labels.brandName;

  return {
    customerName,
    labels,
    logoSrc,
    logoAlt,
    onboardingBannerHref,
    headerNotifications: accountNotifications.headerNotifications,
    notificationsUnreadCount: accountNotifications.unreadCount,
    cartHref: '/cart',
    cartCount,
    ordersHref: '/account/orders/',
    subscriptionsHref: '/account/subscriptions/',
    shopHref: '/shop-all',
    wishlistsHref: '/account/wishlists/',
    settingsHref: '/account/settings/',
    contactHref: '/contact-us',
    logoutHref: '/logout',
    searchPlaceholder: tSearch('inputPlaceholder'),
    accountMenuLinks: buildAccountMenuLinks((key) => tAccount(key)),
  };
}
