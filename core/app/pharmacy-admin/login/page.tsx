import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PharmacistLoginForm } from '~/app/pharmacy-admin/login/pharmacist-login-form';
import { getBcAppSession } from '~/lib/bc-app-session';
import {
  PHARMACIST_PORTAL_PATH,
  getPharmacistSession,
} from '~/lib/pharmacist-session';

export const metadata: Metadata = {
  title: 'Pharmacist sign-in',
  robots: { index: false, follow: false },
};

export default async function BcAppPharmacistLoginPage() {
  const bcSession = await getBcAppSession();

  if (!bcSession) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5] px-4">
        <div className="max-w-md space-y-3 rounded-2xl border border-[#e5dfd5] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-[#2c2a26]">Open from BigCommerce</h1>
          <p className="text-sm leading-6 text-[#6b6560]">
            Pharmacist admin only runs inside the BigCommerce control panel. Open the Liivv Staff
            app from Apps in your store admin, then sign in with the shared username and password.
          </p>
        </div>
      </div>
    );
  }

  if (await getPharmacistSession()) {
    redirect(PHARMACIST_PORTAL_PATH);
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#e5dfd5] bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Liivv</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#2c2a26]">Pharmacist sign-in</h1>
          <p className="mt-3 text-sm leading-6 text-[#6b6560]">
            You opened this from BigCommerce admin. Sign in with the shared pharmacist username and
            password to approve prescriptions and answer care chat.
          </p>
        </div>
        <PharmacistLoginForm />
      </div>
    </div>
  );
}
