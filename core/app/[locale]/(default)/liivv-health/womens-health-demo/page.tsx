import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';

import { getWhDemoCatalog } from './get-wh-demo-catalog';
import { WomensHealthDemoPage } from './womens-health-demo-page';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Women's Health & Wellness | Liivv",
  description:
    'Care that moves with your life — from everyday rhythm to whole new chapters. Liivv Women wellness, pharmacist chat, and life-stage chapters.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const catalog = await getWhDemoCatalog(locale);

  return <WomensHealthDemoPage catalog={catalog} />;
}
