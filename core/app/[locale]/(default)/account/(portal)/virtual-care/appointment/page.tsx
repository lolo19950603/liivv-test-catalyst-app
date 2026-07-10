import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { VirtualCareAppointmentClient } from '~/components/virtual-care/virtual-care-appointment-client';
import { getOnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return { title: 'Book appointment' };
}

export default async function VirtualCareAppointmentPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/virtual-care/appointment');
  }

  return <VirtualCareAppointmentClient />;
}
