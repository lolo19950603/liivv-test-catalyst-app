import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { isLoggedIn } from '~/auth';
import { locales } from '~/i18n/locales';

import { getWhCatalog } from './get-wh-catalog';
import { WomensHealthPage } from './womens-health-page';

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

  const catalog = await getWhCatalog(locale);
  const showGuestQuiz = !(await isLoggedIn());

  return <WomensHealthPage catalog={catalog} showGuestQuiz={showGuestQuiz} />;
}
