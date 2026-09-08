import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import { VendorOutageNotice } from '~/components/vendor-outage-notice';
import { getAccountDashboardShellProps } from '~/lib/account-dashboard/get-dashboard-shell-props';
import { isVendorOutageError } from '~/lib/vendor-outage';

export const dynamic = 'force-dynamic';

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AccountPortalLayout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  let shellProps;

  try {
    shellProps = await getAccountDashboardShellProps(locale);
  } catch (error) {
    if (isVendorOutageError(error)) {
      return <VendorOutageNotice layout="page" vendor={error.vendor} />;
    }

    throw error;
  }

  if (!shellProps) {
    redirect('/login?redirectTo=/account/dashboard/');
  }

  return <AccountDashboardPortal {...shellProps}>{children}</AccountDashboardPortal>;
}
