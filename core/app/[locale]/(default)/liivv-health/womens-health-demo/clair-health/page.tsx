import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';

import { ClairHealthDemoPage } from './clair-health-demo-page';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Clair Health | Liivv',
  description:
    "Clair is the world's first continuous, noninvasive hormone wearable — available through Liivv. Know your rhythm. Pre-order now.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <ClairHealthDemoPage />;
}
