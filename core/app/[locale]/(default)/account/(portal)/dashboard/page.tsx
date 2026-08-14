import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { HealthDashboardMain } from '~/components/account-dashboard/health-dashboard-main';
import { getWellnessDashboardContext } from '~/lib/account-dashboard/get-wellness-dashboard-context';
import { buildDashboardLabels } from '~/lib/account-dashboard/dashboard-labels';
import { getAccountDashboardNotifications } from '~/lib/account-notifications/get-header-notifications';

import { getHealthProfileStepData } from '../health-profile/page-data';

import { getDashboardCustomer, getDashboardNextSubscriptionDate } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ oliviaCelebrate?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.Dashboard' });

  return {
    title: t('metaTitle'),
  };
}

export default async function AccountDashboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { oliviaCelebrate } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Dashboard');
  const customer = await getDashboardCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/dashboard/');
  }

  const [nextSubscriptionDate, wellness, accountNotifications, healthProfileStepData] =
    await Promise.all([
      getDashboardNextSubscriptionDate(locale),
      getWellnessDashboardContext(),
      getAccountDashboardNotifications(locale),
      getHealthProfileStepData(),
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

  return (
    <HealthDashboardMain
      carePackHref="/account/pharmacy?section=carepack"
      consultingHref="/account/virtual-care"
      hasUnreadChatMessage={accountNotifications.hasUnreadChatMessage}
      healthProfileComplete={wellness.healthProfileComplete}
      healthProfileStepData={{
        initialCategories: healthProfileStepData?.initialCategories ?? [],
        isOntario: healthProfileStepData?.isOntario ?? false,
        initialHealthProfile: healthProfileStepData?.initialHealthProfile ?? null,
        supabaseReady: healthProfileStepData?.supabaseReady ?? false,
      }}
      insuranceComplete={wellness.insuranceComplete}
      celebrateOnMount={oliviaCelebrate === '1'}
      labels={labels}
      nextSubscriptionDate={nextSubscriptionDate}
      ordersHref="/account/orders/"
      pharmacyHref="/account/pharmacy"
      subscriptionsHref="/account/subscriptions/"
    />
  );
}
