import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { getStaffPortalData } from '~/app/pharmacy-admin/page-data';
import { logoutPharmacist } from '~/app/pharmacy-admin/_actions/logout';
import { StaffPortalClient } from '~/components/staff/staff-portal-client';
import { getBcAppSession } from '~/lib/bc-app-session';
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

export default async function BcAppPharmacistPage({ searchParams }: Props) {
  const bcSession = await getBcAppSession();

  if (!bcSession) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5] px-4">
        <div className="max-w-md space-y-3 rounded-2xl border border-[#e5dfd5] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-[#2c2a26]">Open from BigCommerce</h1>
          <p className="text-sm leading-6 text-[#6b6560]">
            Pharmacist admin only runs inside the BigCommerce control panel. Open the Liivv Staff
            app from Apps in your store admin.
          </p>
        </div>
      </div>
    );
  }

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
