import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AccountDashboardPortal } from '~/components/account-dashboard';
import { getAccountDashboardShellProps } from '~/lib/account-dashboard/get-dashboard-shell-props';
import { getDashboardCustomer } from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { getDashboardPostLoginRedirect } from '~/lib/supabase/post-login-redirect';

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

  const customer = await getDashboardCustomer();

  if (customer) {
    const postLoginRedirect = await getDashboardPostLoginRedirect({
      entityId: customer.entityId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    });

    if (postLoginRedirect) {
      redirect(postLoginRedirect);
    }
  }

  return <AccountDashboardPortal {...shellProps}>{children}</AccountDashboardPortal>;
}
