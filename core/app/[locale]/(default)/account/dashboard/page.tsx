import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import type { AccountDashboardLabels } from '~/components/account-dashboard/types';
import { getWellnessDashboardContext } from '~/app/[locale]/(default)/account/onboarding/page-data';
import { getDashboardPostLoginRedirect } from '~/lib/supabase/post-login-redirect';
import { getFirstIncompleteOnboardingHref } from '~/lib/supabase/onboarding-redirect';
import { appendSetupFlowQuery } from '~/lib/onboarding/onboarding-flow';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

import { getAccountDashboardNotifications } from '~/lib/account-notifications/get-header-notifications';

import { getDashboardCustomer, getDashboardNextSubscriptionDate } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.Dashboard' });

  return {
    title: t('metaTitle'),
  };
}

function buildLabels(
  t: (key: string, values?: Record<string, string>) => string,
  customerFirstName: string,
  heroTitle?: string,
  heroSubtitle?: string,
): AccountDashboardLabels {
  return {
    signOut: t('signOut'),
    notifications: t('notifications'),
    notificationsUnread: t('notificationsUnread'),
    notificationsPanelTitle: t('notificationsPanelTitle'),
    notificationsEmpty: t('notificationsEmpty'),
    cart: t('cart'),
    search: t('search'),
    myAccount: t('myAccount'),
    accountSettings: t('accountSettings'),
    sidebar: {
      home: t('sidebar.home'),
      orders: t('sidebar.orders'),
      shop: t('sidebar.shop'),
      loyalty: t('sidebar.loyalty'),
      settings: t('sidebar.settings'),
      help: t('sidebar.help'),
    },
    wellness: {
      greeting: t('wellness.greeting', { name: customerFirstName }),
      welcomeLead: t('wellness.welcomeLead'),
      hero: {
        basedOnSelection: t('wellness.hero.basedOnSelection'),
        title: heroTitle ?? t('wellness.hero.title'),
        subtitle: heroSubtitle ?? t('wellness.hero.subtitle'),
        dailyTips: {
          title: t('wellness.hero.dailyTips.title'),
          description: t('wellness.hero.dailyTips.description'),
        },
        yourSupplies: {
          title: t('wellness.hero.yourSupplies.title'),
          description: t('wellness.hero.yourSupplies.description'),
        },
        exploreMore: t('wellness.hero.exploreMore'),
        tabs: {
          diabetes: t('wellness.hero.tabs.diabetes'),
          sleepRest: t('wellness.hero.tabs.sleepRest'),
          changeSelection: t('wellness.hero.tabs.changeSelection'),
        },
      },
      actionCenter: {
        subscriptionTitle: t('wellness.actionCenter.subscriptionTitle'),
        subscriptionManage: t('wellness.actionCenter.subscriptionManage'),
        subscriptionEmpty: t('wellness.actionCenter.subscriptionEmpty'),
        orderHistory: t('wellness.actionCenter.orderHistory'),
      },
      virtualCare: {
        title: t('wellness.virtualCare.title'),
        consulting: t('wellness.virtualCare.consulting'),
        carePack: t('wellness.virtualCare.carePack'),
        pharmacy: t('wellness.virtualCare.pharmacy'),
        unreadMessages: t('wellness.virtualCare.unreadMessages'),
        hasNewMessage: t('wellness.virtualCare.hasNewMessage'),
        noNewMessages: t('wellness.virtualCare.noNewMessages'),
        openInbox: t('wellness.virtualCare.openInbox'),
      },
    },
  };
}

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Dashboard');
  const customer = await getDashboardCustomer();
  const nextSubscriptionDate = await getDashboardNextSubscriptionDate(locale);
  const wellness = await getWellnessDashboardContext();

  if (customer) {
    const postLoginRedirect = await getDashboardPostLoginRedirect({
      entityId: customer.entityId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    });

    if (postLoginRedirect) {
      redirect(postLoginRedirect);
    }
  }

  let onboardingBannerHref: string | null = null;

  if (customer && !wellness.onboardingComplete) {
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

  const firstName = customer?.firstName?.trim() ?? '';
  const lastName = customer?.lastName?.trim() ?? '';
  const customerName =
    [firstName, lastName].filter(Boolean).join(' ') || t('guestName');
  const firstNameForGreeting = firstName.length > 0 ? firstName : customerName;
  const heroTitle = wellness.primaryCategory?.label;
  const heroSubtitle = wellness.primaryCategory?.subtitle;
  const accountNotifications = await getAccountDashboardNotifications();

  return (
    <AccountDashboardPortal
      cartHref="/cart"
      contactHref="/contact-us"
      customerName={customerName}
      hasUnreadChatMessage={accountNotifications.hasUnreadChatMessage}
      headerNotifications={accountNotifications.headerNotifications}
      labels={buildLabels(
        t as (key: string, values?: Record<string, string>) => string,
        firstNameForGreeting,
        heroTitle,
        heroSubtitle,
      )}
      logoutHref="/logout"
      loyaltyHref="/account/wishlists/"
      nextSubscriptionDate={nextSubscriptionDate}
      notificationsUnreadCount={accountNotifications.unreadCount}
      onboardingBannerHref={onboardingBannerHref}
      ordersHref="/account/orders/"
      settingsHref="/account/settings/"
      shopHref="/shop-all"
      subscriptionsHref="/account/subscriptions/"
      virtualCareCarePackHref="/account/pharmacy?section=carepack"
      virtualCareChatHref="/account/virtual-care/chat"
      virtualCareConsultingHref="/account/virtual-care"
      virtualCarePharmacyHref="/account/pharmacy"
      wellnessSelectionHref="/account/onboarding/health-profile/"
    />
  );
}
