import { Metadata } from 'next';
import { Suspense } from 'react';

import { getStaffPortalData } from '~/app/staff/page-data';
import { StaffPortalClient } from '~/components/staff/staff-portal-client';
import {
  getBcAppAuthCallbackUrl,
  getBcAppLoadCallbackUrl,
  getBcAppUninstallCallbackUrl,
  isBcAppConfigured,
} from '~/lib/bigcommerce/app-oauth';
import { getStaffAccessContext } from '~/lib/staff-access';

export const metadata: Metadata = {
  title: 'Liivv Staff',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function CallbackList({ title, url }: { title: string; url: string | null }) {
  if (!url) {
    return null;
  }

  return (
    <p className="rounded-lg border border-[#ebe6df] bg-[#faf8f5] px-3 py-2 text-sm text-[#4a4540]">
      {title}: <span className="font-mono text-xs">{url}</span>
    </p>
  );
}

function BcAppSetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-[#e5dfd5] bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Liivv Staff</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#2c2a26]">BigCommerce app setup required</h1>
          <p className="mt-3 text-sm leading-6 text-[#6b6560]">
            Configure a draft app in the BigCommerce Developer Portal and set{' '}
            <code>BIGCOMMERCE_APP_CLIENT_ID</code>, <code>BIGCOMMERCE_APP_CLIENT_SECRET</code>, and{' '}
            <code>BIGCOMMERCE_APP_URL</code> (your public storefront URL).
          </p>
        </div>
        <div className="space-y-2">
          <CallbackList title="Auth callback URL" url={getBcAppAuthCallbackUrl()} />
          <CallbackList title="Load callback URL" url={getBcAppLoadCallbackUrl()} />
          <CallbackList title="Uninstall callback URL" url={getBcAppUninstallCallbackUrl()} />
        </div>
        <p className="text-sm text-[#6b6560]">
          After installing the app on your store, open it from <strong>Apps → My apps</strong> in the
          BigCommerce control panel.
        </p>
      </div>
    </div>
  );
}

function BcAppSignInNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#e5dfd5] bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Liivv Staff</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#2c2a26]">Open from BigCommerce</h1>
        <p className="mt-3 text-sm leading-6 text-[#6b6560]">
          This portal is embedded in the BigCommerce control panel. Open{' '}
          <strong>Apps → My apps → Liivv Staff</strong> to sign in automatically with your store
          account.
        </p>
      </div>
    </div>
  );
}

export default async function BcAppPage({ searchParams }: Props) {
  if (!isBcAppConfigured()) {
    return <BcAppSetupNotice />;
  }

  const access = await getStaffAccessContext();

  if (!access) {
    return <BcAppSignInNotice />;
  }

  const params = await searchParams;
  const data = await getStaffPortalData(params);
  const embeddedUserEmail = access.kind === 'bc-app' ? access.userEmail : undefined;

  return (
    <Suspense fallback={<p className="p-8 text-sm text-[#6b6560]">Loading Liivv Staff…</p>}>
      <StaffPortalClient
        basePath="/bc-app"
        data={data}
        embedded
        embeddedUserEmail={embeddedUserEmail}
      />
    </Suspense>
  );
}
