import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import type { AccountDashboardLabels } from '~/components/account-dashboard/types';

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
  customerFirstName: string,
): AccountDashboardLabels {
  return {
    signOut: t('signOut'),
    notifications: t('notifications'),
    cart: t('cart'),
    myAccount: t('myAccount'),
    accountSettings: t('accountSettings'),
    featuredNav: {
      prescriptions: t('featuredNav.prescriptions'),
      appointments: t('featuredNav.appointments'),
      metrics: t('featuredNav.metrics'),
    },
    megaNav: [
      t('megaNav.healthDashboard'),
      t('megaNav.digitalPharmacy'),
      t('megaNav.featuredServices'),
      t('megaNav.bookHealthServices'),
      t('megaNav.healthResources'),
      t('megaNav.orders'),
      t('megaNav.rewards'),
    ],
    healthCenter: {
      greeting: {
        morning: t('healthCenter.greeting.morning', { name: customerFirstName }),
        afternoon: t('healthCenter.greeting.afternoon', { name: customerFirstName }),
        evening: t('healthCenter.greeting.evening', { name: customerFirstName }),
      },
      welcomeLead: t('healthCenter.welcomeLead'),
      prescriptions: {
        title: t('healthCenter.prescriptions.title'),
        heading: t('healthCenter.prescriptions.heading'),
        description: t('healthCenter.prescriptions.description'),
        cta: t('healthCenter.prescriptions.cta'),
      },
      appointments: {
        title: t('healthCenter.appointments.title'),
        heading: t('healthCenter.appointments.heading'),
        description: t('healthCenter.appointments.description'),
        cta: t('healthCenter.appointments.cta'),
      },
      quickLinksTitle: t('healthCenter.quickLinksTitle'),
      quickLinks: {
        prescriptions: {
          title: t('healthCenter.quickLinks.prescriptions.title'),
          description: t('healthCenter.quickLinks.prescriptions.description'),
        },
        appointments: {
          title: t('healthCenter.quickLinks.appointments.title'),
          description: t('healthCenter.quickLinks.appointments.description'),
        },
        metrics: {
          title: t('healthCenter.quickLinks.metrics.title'),
          description: t('healthCenter.quickLinks.metrics.description'),
        },
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
  const firstNameForGreeting = firstName.length > 0 ? firstName : customerName;

  return (
    <AccountDashboardPortal
      cartHref="/cart"
      customerName={customerName}
      labels={buildLabels(t, firstNameForGreeting)}
      logoutHref="/logout"
      ordersHref="/account/orders/"
    />
  );
}
