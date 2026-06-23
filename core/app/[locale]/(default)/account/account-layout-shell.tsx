'use client';

import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import { usePathname } from '~/i18n/routing';

interface Props {
  children: ReactNode;
}

/** Full-screen dashboard skips the classic account page shell padding. */
export function AccountLayoutShell({ children }: Props) {
  const pathname = usePathname() ?? '';
  const isDashboard = pathname.includes('/account/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <section className={clsx('liivv-account-pages group/pending @container')}>
      <div className="mx-auto flex w-full max-w-[var(--section-max-width-2xl,1536px)] flex-col px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        {children}
      </div>
    </section>
  );
}
