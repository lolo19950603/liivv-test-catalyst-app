import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { defaultLocale, locales } from '~/i18n/locales';
import { routing } from '~/i18n/routing';
import { client, getMakeswiftPageMetadata, Page } from '~/lib/makeswift';

interface PageParams {
  locale: string;
  rest: string[];
}

/**
 * App Router trees that must never be claimed by the Makeswift catch-all.
 * Without this guard, nested routes (e.g. Clair, WH chapters) can soft-404
 * when the catch-all wins over a filesystem page indev.
 */
const APP_ROUTER_PREFIXES = [
  '/liivv-health',
  '/account',
  '/cart',
  '/checkout',
  '/product',
  '/blog',
  '/compare',
  '/wishlist',
  '/gift-certificates',
  '/build-your-own-kit',
  '/kit',
  '/diabetes-care',
  '/subscribe',
  '/webpages',
] as const;

function isAppRouterPath(path: string) {
  return APP_ROUTER_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Only serve pre-known Makeswift paths; do not greedily steal App Router URLs. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { rest, locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const path = `/${rest.join('/')}`;

  if (isAppRouterPath(path)) {
    notFound();
  }

  const metadata = await getMakeswiftPageMetadata({ path, locale });

  return metadata ?? {};
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const pages = await client.getPages().toArray();

  const params = pages
    .filter((page) => page.path !== '/')
    .filter((page) => !isAppRouterPath(page.path))
    .flatMap((page) => localesFanOut(page.path));

  // Next.js requires providing at least one value in `generateStaticParams`.
  //
  // See https://github.com/vercel/next.js/pull/73933
  if (params.length === 0) {
    return [{ rest: ['dev', 'null'], locale: defaultLocale }];
  }

  return params;
}

export default async function CatchAllPage({ params }: { params: Promise<PageParams> }) {
  const { rest, locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const path = `/${rest.join('/')}`;

  if (isAppRouterPath(path)) {
    notFound();
  }

  return <Page locale={locale} path={path} />;
}

function localesFanOut(path: string): PageParams[] {
  return locales.map((locale) => ({
    rest: path.split('/').filter((segment) => segment !== ''),
    locale,
  }));
}
