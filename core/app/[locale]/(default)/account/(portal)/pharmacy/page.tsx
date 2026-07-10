import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { PharmacyDashboard } from '~/components/pharmacy/pharmacy-dashboard';

import { getCustomerProvince, getPharmacyPageData } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return { title: 'Pharmacy' };
}

export default async function PharmacyPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [data, userProvince] = await Promise.all([getPharmacyPageData(), getCustomerProvince()]);

  if (!data) {
    redirect('/login?redirectTo=/account/pharmacy');
  }

  return (
    <Suspense fallback={<p className="text-sm text-[#6b6560]">Loading pharmacy…</p>}>
      <PharmacyDashboard
        carepackRequests={data.carepackRequests}
        displayName={data.displayName}
        prescriptions={data.prescriptions}
        refillRequests={data.refillRequests}
        supabaseReady={data.supabaseReady}
        userProvince={userProvince}
      />
    </Suspense>
  );
}
