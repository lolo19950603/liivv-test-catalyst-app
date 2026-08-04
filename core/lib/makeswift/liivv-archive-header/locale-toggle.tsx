'use client';

import { clsx } from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { startNavigationLoading, stopNavigationLoading } from '~/components/navigation-loading';
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
  // Show the target locale immediately on click; sync back when navigation finishes.
  const [displayedLocale, setDisplayedLocale] = useState(activeLocale);

  useEffect(() => {
    setDisplayedLocale(activeLocale);
  }, [activeLocale]);

  const switchLocale = useCallback(
    (targetLocale: string) => {
      if (targetLocale === activeLocale || targetLocale === displayedLocale) {
        return;
      }

      // Slide the pill and show loading immediately; path lookup + route change catch up after.
      setDisplayedLocale(targetLocale);
      startNavigationLoading({ immediate: true });

      void (async () => {
        try {
          const localizedPathname = await getLocalizedPathname({
            pathname,
            activeLocale,
            targetLocale,
          });

          startTransition(() => {
            router.push(
              {
                pathname: localizedPathname,
                // @ts-expect-error -- pathname and params always match the current route
                params,
                query: Object.fromEntries(searchParams.entries()),
              },
              { locale: targetLocale },
            );
          });
        } catch {
          setDisplayedLocale(activeLocale);
          stopNavigationLoading();
        }
      })();
    },
    [pathname, activeLocale, displayedLocale, params, router, searchParams],
  );

  if (locales.length < 2) {
    return null;
  }

  const activeIndex = Math.max(
    0,
    locales.findIndex((code) => code === displayedLocale),
  );
  const isSwitching = isPending || displayedLocale !== activeLocale;

  return (
    <div
      aria-label={t('label')}
      className={clsx('header-locale-toggle', isSwitching && 'is-pending', className)}
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
        const isActive = code === displayedLocale;

        return (
          <button
            aria-label={t('switchTo', { locale: localeLabel(code) })}
            aria-pressed={isActive}
            className={clsx('header-locale-toggle__option', isActive && 'is-active')}
            disabled={isSwitching}
            key={code}
            onClick={() => {
              if (!isActive) {
                switchLocale(code);
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
