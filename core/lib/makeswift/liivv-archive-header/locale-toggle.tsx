'use client';

import { clsx } from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { locales } from '~/i18n/locales';
import { usePathname, useRouter } from '~/i18n/routing';
import { getLocalizedPathname } from '@/vibes/soul/primitives/navigation/_actions/localized-pathname';

function localeLabel(code: string): string {
  return code.split('-')[0]?.toUpperCase() ?? code.toUpperCase();
}

export function LocaleToggle({ className }: { className?: string }) {
  const activeLocale = useLocale();
  const t = useTranslations('Components.Header.SwitchLocale');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const switchLocale = useCallback(
    async (targetLocale: string) => {
      if (targetLocale === activeLocale) {
        return;
      }

      const localizedPathname = await getLocalizedPathname({
        pathname,
        activeLocale,
        targetLocale,
      });

      router.push(
        {
          pathname: localizedPathname,
          // @ts-expect-error -- pathname and params always match the current route
          params,
          query: Object.fromEntries(searchParams.entries()),
        },
        { locale: targetLocale },
      );
    },
    [pathname, activeLocale, params, router, searchParams],
  );

  if (locales.length < 2) {
    return null;
  }

  const activeIndex = Math.max(
    0,
    locales.findIndex((code) => code === activeLocale),
  );

  return (
    <div
      aria-label={t('label')}
      className={clsx('header-locale-toggle', isPending && 'is-pending', className)}
      role="group"
    >
      <span
        aria-hidden
        className="header-locale-toggle__thumb"
        style={{
          width: `calc((100% - (var(--locale-toggle-pad) * 2)) / ${locales.length})`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />
      {locales.map((code) => {
        const isActive = code === activeLocale;

        return (
          <button
            aria-label={t('switchTo', { locale: localeLabel(code) })}
            aria-pressed={isActive}
            className={clsx('header-locale-toggle__option', isActive && 'is-active')}
            disabled={isPending}
            key={code}
            onClick={() => {
              if (!isActive) {
                startTransition(() => switchLocale(code));
              }
            }}
            type="button"
          >
            {localeLabel(code)}
          </button>
        );
      })}
    </div>
  );
}
