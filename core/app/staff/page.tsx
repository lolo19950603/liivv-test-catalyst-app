import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { StaffPortalClient } from '~/components/staff/staff-portal-client';
import { isValidStaffSession } from '~/lib/admin-auth';

import { getStaffPortalData } from './page-data';

export const metadata: Metadata = {
  title: 'Staff portal',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StaffPortalPage({ searchParams }: Props) {
  const authed = await isValidStaffSession();

  if (!authed) {
    redirect('/staff/login');
  }

  const params = await searchParams;
  const data = await getStaffPortalData(params);

  return (
    <Suspense fallback={<p className="p-8 text-sm text-[#6b6560]">Loading staff portal…</p>}>
      <StaffPortalClient data={data} />
    </Suspense>
  );
}
