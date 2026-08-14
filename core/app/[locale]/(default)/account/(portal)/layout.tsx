import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import { getAccountDashboardShellProps } from '~/lib/account-dashboard/get-dashboard-shell-props';

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AccountPortalLayout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const shellProps = await getAccountDashboardShellProps(locale);

  if (!shellProps) {
    redirect('/login?redirectTo=/account/dashboard/');
  }

  return <AccountDashboardPortal {...shellProps}>{children}</AccountDashboardPortal>;
}
