import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { SidebarMenu } from '@/vibes/soul/sections/sidebar-menu';

import { AccountLayoutShell } from './account-layout-shell';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Layout');

  return (
    <AccountLayoutShell
      sidebar={
        <SidebarMenu
          links={[
            { href: '/account/dashboard/', label: t('dashboard') },
            { href: '/account/orders/', label: t('orders') },
            { href: '/account/subscriptions/', label: t('subscriptions') },
            { href: '/account/addresses/', label: t('addresses') },
            { href: '/account/settings/', label: t('settings') },
            { href: '/account/wishlists/', label: t('wishlists') },
            { href: '/logout', label: t('logout'), prefetch: 'none' },
          ]}
        />
      }
    >
      {children}
    </AccountLayoutShell>
  );
}
