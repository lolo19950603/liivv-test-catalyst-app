import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { AccountLayoutShell } from './account-layout-shell';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <AccountLayoutShell>{children}</AccountLayoutShell>;
}
