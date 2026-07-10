import deepmerge from 'deepmerge';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { locales } from './locales';

// The language to fall back to if the requested message string is not available.
const fallbackLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // `/staff` and `/admin` sit outside `[locale]` and bypass the intl proxy.
  if (locale != null && !locales.includes(locale)) {
    notFound();
  }

  const resolvedLocale =
    locale != null && locales.includes(locale) ? locale : fallbackLocale;

  if (resolvedLocale === fallbackLocale) {
    return {
      locale: resolvedLocale,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      messages: (await import(`../messages/${resolvedLocale}.json`)).default,
    };
  }

  return {
    locale: resolvedLocale,
    messages: deepmerge(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      (await import(`../messages/${fallbackLocale}.json`)).default,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      (await import(`../messages/${resolvedLocale}.json`)).default,
    ),
  };
});
