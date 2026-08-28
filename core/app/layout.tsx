import { getSiteVersion } from '@makeswift/runtime/next/server';
import { clsx } from 'clsx';
import { getLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import '../globals.css';

import { fonts } from '~/app/fonts';
import { NavigationLoadingOverlay } from '~/components/navigation-loading';
import { SiteTheme } from '~/lib/makeswift/components/site-theme';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

import '~/lib/makeswift/components';

export default async function RootLayout({ children }: PropsWithChildren) {
  const siteVersion = await getSiteVersion();
  /*
   * The <html> element lives here, above the [locale] segment, so it used to be
   * hardcoded lang="en" — every French route served ~780 translated strings
   * under an English language declaration. A screen reader picks its speech
   * synthesiser off this attribute, so the whole locale was read with English
   * phonetics (WCAG 3.1.1, Level A).
   */
  const locale = await getLocale();

  return (
    <MakeswiftProvider siteVersion={siteVersion}>
      <html className={clsx(fonts.map((f) => f.variable))} lang={locale === 'fr' ? 'fr-CA' : 'en-CA'}>
        <head>
          <SiteTheme />
        </head>
        <body className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <NavigationLoadingOverlay />
          </Suspense>
          {children}
        </body>
      </html>
    </MakeswiftProvider>
  );
}
