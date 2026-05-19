import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMakeswiftPageMetadata, Page as MakeswiftPage } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

const PAGE_PATH = '/diabetes-care';

// eslint-disable-next-line valid-jsdoc
/** Next.js metadata (Makeswift title/description when set, plus alternates). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const makeswiftMetadata = await getMakeswiftPageMetadata({
    path: PAGE_PATH,
    locale,
  });

  return {
    title: makeswiftMetadata?.title ?? 'Diabetes care',
    ...(makeswiftMetadata?.description != null && { description: makeswiftMetadata.description }),
    alternates: await getMetadataAlternates({ path: PAGE_PATH, locale }),
    robots: { index: false, follow: false },
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

export default async function DiabetesCarePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <MakeswiftPage locale={locale} path={PAGE_PATH} />;
}
