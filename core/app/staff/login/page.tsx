import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { StaffLoginForm } from '~/components/staff/staff-login-form';
import { isStaffAuthConfigured, isValidStaffSession } from '~/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Staff login',
  robots: { index: false, follow: false },
};

export default async function StaffLoginPage() {
  if (await isValidStaffSession()) {
    redirect('/staff');
  }

  const configured = isStaffAuthConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e5dfd5] bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Liivv staff</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#2c2a26]">Sign in</h1>
        <p className="mt-2 text-sm text-[#6b6560]">
          Pharmacy and care team portal for prescriptions, refills, CarePack, and customer chat.
        </p>
        {!configured ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Set ADMIN_DASHBOARD_PASSWORD and ADMIN_SESSION_SECRET in your environment.
          </p>
        ) : (
          <Suspense fallback={<p className="mt-6 text-sm text-[#8a8176]">Loading…</p>}>
            <StaffLoginForm />
          </Suspense>
        )}
      </div>
    </div>
  );
}
