import 'server-only';

import { getTranslations } from 'next-intl/server';

import { getWellnessDashboardContext } from '~/app/[locale]/(default)/account/onboarding/page-data';
import {
  getDashboardCustomer,
} from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { buildDashboardLabels } from '~/lib/account-dashboard/dashboard-labels';
import { getAccountDashboardNotifications } from '~/lib/account-notifications/get-header-notifications';
import { appendSetupFlowQuery } from '~/lib/onboarding/onboarding-flow';
import { getFirstIncompleteOnboardingHref } from '~/lib/supabase/onboarding-redirect';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { getStoreLogoFallback } from '~/lib/store-theme/get-store-logo-fallback';

import { getDashboardStoreNav } from '~/lib/account-dashboard/get-dashboard-store-nav';
import type { DashboardStoreNav } from '~/lib/account-dashboard/get-dashboard-store-nav';

import type { AccountDashboardLabels } from '~/components/account-dashboard/types';
import type { AccountHeaderNotification } from '~/lib/account-notifications/types';

export interface AccountDashboardShellData {
  customerName: string;
  labels: AccountDashboardLabels;
  logoSrc: string;
  logoAlt: string;
  onboardingBannerHref: string | null;
  headerNotifications: AccountHeaderNotification[];
  notificationsUnreadCount: number;
  cartHref: string;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  wishlistsHref: string;
  settingsHref: string;
  contactHref: string;
  logoutHref: string;
  storeNav: DashboardStoreNav;
}

export async function getAccountDashboardShellProps(
  locale: string,
): Promise<AccountDashboardShellData | null> {
  const customer = await getDashboardCustomer();

  if (!customer) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: 'Account.Dashboard' });
  const [wellness, accountNotifications, storeLogo, storeNav] = await Promise.all([
    getWellnessDashboardContext(),
    getAccountDashboardNotifications(locale),
    getStoreLogoFallback(),
    getDashboardStoreNav(),
  ]);

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
    ordersHref: '/account/orders/',
    subscriptionsHref: '/account/subscriptions/',
    shopHref: '/shop-all',
    wishlistsHref: '/account/wishlists/',
    settingsHref: '/account/settings/',
    contactHref: '/contact-us',
    logoutHref: '/logout',
    storeNav,
  };
}
