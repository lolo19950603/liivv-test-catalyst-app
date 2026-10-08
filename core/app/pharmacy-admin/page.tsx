import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { getStaffPortalData } from '~/app/pharmacy-admin/page-data';
import { logoutPharmacist } from '~/app/pharmacy-admin/_actions/logout';
import { StaffPortalClient } from '~/components/staff/staff-portal-client';
import {
  PHARMACIST_LOGIN_PATH,
  PHARMACIST_PORTAL_PATH,
} from '~/lib/pharmacist-session';
import { getStaffAccessContext } from '~/lib/staff-access';

export const metadata: Metadata = {
  title: 'Pharmacist admin',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PharmacyAdminPage({ searchParams }: Props) {
  const access = await getStaffAccessContext();

  if (!access) {
    redirect(PHARMACIST_LOGIN_PATH);
  }

  const params = await searchParams;
  const data = await getStaffPortalData(params);

  return (
    <Suspense fallback={<p className="p-8 text-sm text-[#6b6560]">Loading pharmacist admin…</p>}>
      <StaffPortalClient
        basePath={PHARMACIST_PORTAL_PATH}
        data={data}
        signedInAs={access.username}
        signOutAction={logoutPharmacist}
      />
    </Suspense>
  );
}
