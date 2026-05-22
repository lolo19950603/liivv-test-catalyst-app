'use client';

import { usePathname } from '~/i18n/routing';
import { type ReactNode } from 'react';

import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

interface Props {
  children: ReactNode;
  sidebar: ReactNode;
}

/** Full-screen dashboard skips the classic account sidebar shell. */
export function AccountLayoutShell({ children, sidebar }: Props) {
  const pathname = usePathname() ?? '';
  const isDashboard = pathname.includes('/account/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <StickySidebarLayout sidebar={sidebar} sidebarSize="small">
      {children}
    </StickySidebarLayout>
  );
}
