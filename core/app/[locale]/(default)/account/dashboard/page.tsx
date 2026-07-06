import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import type { AccountDashboardLabels } from '~/components/account-dashboard/types';

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
): AccountDashboardLabels {
  return {
    signOut: t('signOut'),
    notifications: t('notifications'),
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
        title: t('wellness.hero.title'),
        subtitle: t('wellness.hero.subtitle'),
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

  const firstName = customer?.firstName?.trim() ?? '';
  const lastName = customer?.lastName?.trim() ?? '';
  const customerName =
    [firstName, lastName].filter(Boolean).join(' ') || t('guestName');
  const firstNameForGreeting = firstName.length > 0 ? firstName : customerName;

  return (
    <AccountDashboardPortal
      cartHref="/cart"
      contactHref="/contact-us"
      customerName={customerName}
      labels={buildLabels(
        t as (key: string, values?: Record<string, string>) => string,
        firstNameForGreeting,
      )}
      logoutHref="/logout"
      loyaltyHref="/account/wishlists/"
      nextSubscriptionDate={nextSubscriptionDate}
      ordersHref="/account/orders/"
      settingsHref="/account/settings/"
      shopHref="/shop-all"
      subscriptionsHref="/account/subscriptions/"
    />
  );
}
