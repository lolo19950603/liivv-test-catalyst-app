'use client';

import { usePathname as useNextPathname } from 'next/navigation';

import { locales } from './locales';

/** Current pathname without locale prefix; does not require NextIntlClientProvider. */
export function useLocalizedPathname(): string {
  const pathname = useNextPathname() ?? '';
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] ?? '')) {
    const rest = segments.slice(1);

    return rest.length > 0 ? `/${rest.join('/')}` : '/';
  }

  return pathname || '/';
}
