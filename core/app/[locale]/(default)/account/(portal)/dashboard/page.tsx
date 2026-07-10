import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { HealthDashboardMain } from '~/components/account-dashboard/health-dashboard-main';
import { getWellnessDashboardContext } from '~/app/[locale]/(default)/account/onboarding/page-data';
import { buildDashboardHeroPanels } from '~/lib/account-dashboard/build-dashboard-hero-panels';
import { buildDashboardHeroTabs } from '~/lib/account-dashboard/build-hero-tabs';
import { buildDashboardLabels } from '~/lib/account-dashboard/dashboard-labels';
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

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Dashboard');
  const customer = await getDashboardCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/dashboard/');
  }

  const [nextSubscriptionDate, wellness, accountNotifications] = await Promise.all([
    getDashboardNextSubscriptionDate(locale),
    getWellnessDashboardContext(),
    getAccountDashboardNotifications(locale),
  ]);

  const firstName = customer.firstName.trim();
  const lastName = customer.lastName.trim();
  const customerName = [firstName, lastName].filter(Boolean).join(' ') || t('guestName');
  const firstNameForGreeting = firstName.length > 0 ? firstName : customerName;
  const primaryCategoryId = wellness.primaryCategory?.id;
  const shopHref = '/shop-all';
  const wellnessSelectionHref = '/account/health-profile/';

  const labels = buildDashboardLabels(
    t as (key: string, values?: Record<string, string>) => string,
    {
      customerFirstName: firstNameForGreeting,
      primaryCategoryId,
    },
  );

  const heroPanels = buildDashboardHeroPanels({
    careInterests: wellness.careInterests,
    subtitle: labels.wellness.hero.subtitle,
    t: t as (key: string, values?: Record<string, string>) => string,
  });

  const heroTabs = buildDashboardHeroTabs({
    careInterests: wellness.careInterests,
    primaryCategoryId,
    changeSelectionHref: wellnessSelectionHref,
    changeSelectionLabel: labels.wellness.hero.changeSelection,
  });

  return (
    <HealthDashboardMain
      carePackHref="/account/pharmacy?section=carepack"
      consultingHref="/account/virtual-care"
      hasUnreadChatMessage={accountNotifications.hasUnreadChatMessage}
      heroPanels={heroPanels}
      heroTabs={heroTabs}
      initialPanelId={primaryCategoryId}
      labels={labels}
      nextSubscriptionDate={nextSubscriptionDate}
      ordersHref="/account/orders/"
      pharmacyHref="/account/pharmacy"
      shopHref={shopHref}
      subscriptionsHref="/account/subscriptions/"
    />
  );
}
