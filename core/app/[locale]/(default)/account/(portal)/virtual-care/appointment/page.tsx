import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { VirtualCareAppointmentClient } from '~/components/virtual-care/virtual-care-appointment-client';
import { getOnboardingCustomer } from '~/lib/account/get-session-customer';

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

  const configured = process.env.NEXT_PUBLIC_MICROSOFT_BOOKINGS_URL?.trim() ?? '';
  const bookingsUrl = configured.startsWith('https://') ? configured : null;

  return <VirtualCareAppointmentClient bookingsUrl={bookingsUrl} />;
}
