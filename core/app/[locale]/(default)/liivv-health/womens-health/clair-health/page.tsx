import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';

import { ClairHealthPage } from './clair-health-page';
import { getClairCopy } from './copy';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = getClairCopy(locale).meta;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <ClairHealthPage />;
}
