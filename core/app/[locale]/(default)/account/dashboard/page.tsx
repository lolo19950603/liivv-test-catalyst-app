import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import type { AccountDashboardLabels, DashboardPanelId } from '~/components/account-dashboard/types';

import { getDashboardCustomer } from './page-data';

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
  t: Awaited<ReturnType<typeof getTranslations<'Account.Dashboard'>>>,
  customerName: string,
): AccountDashboardLabels {
  const nav: Record<DashboardPanelId, string> = {
    main: t('nav.main'),
    'health-profile': t('nav.health-profile'),
    pharmacy: t('nav.pharmacy'),
    insurance: t('nav.insurance'),
    rewards: t('nav.rewards'),
    orders: t('nav.orders'),
    subscriptions: t('nav.subscriptions'),
  };

  return {
    brandEyebrow: t('brandEyebrow'),
    brandTitle: t('brandTitle'),
    signOut: t('signOut'),
    notifications: t('notifications'),
    cart: t('cart'),
    needHelpTitle: t('needHelp.title'),
    needHelpBody: t('needHelp.body'),
    needHelpToggle: t('needHelp.toggle'),
    nav,
    panels: {
      main: {
        title: t('panels.main.title'),
        lead: t('panels.main.lead', { name: customerName }),
      },
      healthProfile: { title: t('panels.healthProfile.title'), lead: t('panels.healthProfile.lead') },
      pharmacy: { title: t('panels.pharmacy.title'), lead: t('panels.pharmacy.lead') },
      insurance: { title: t('panels.insurance.title'), lead: t('panels.insurance.lead') },
      rewards: { title: t('panels.rewards.title'), lead: t('panels.rewards.lead') },
      orders: {
        title: t('panels.orders.title'),
        lead: t('panels.orders.lead'),
        viewAll: t('panels.orders.viewAll'),
      },
      subscriptions: {
        title: t('panels.subscriptions.title'),
        lead: t('panels.subscriptions.lead'),
      },
    },
  };
}

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Dashboard');
  const customer = await getDashboardCustomer();

  const firstName = customer?.firstName?.trim() ?? '';
  const lastName = customer?.lastName?.trim() ?? '';
  const customerName =
    [firstName, lastName].filter(Boolean).join(' ') || t('guestName');

  return (
    <AccountDashboardPortal
      cartHref="/cart"
      customerName={customerName}
      labels={buildLabels(t, customerName)}
      logoutHref="/logout"
      ordersHref="/account/orders/"
    />
  );
}
