import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { isLoggedIn } from '~/auth';
import { locales } from '~/i18n/locales';

import { DiabetesCarePage } from './diabetes-care-page';
import { getDcCatalog } from './get-dc-catalog';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Diabetes Care & Everyday "LIIVVing" | Liivv',
  description:
    'Supplies, routines, and everyday living support — meters, sensors, restock staples, and Ontario pharmacist chat so diabetes care fits your life.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const catalog = await getDcCatalog(locale);
  const showGuestQuiz = !(await isLoggedIn());

  return <DiabetesCarePage catalog={catalog} showGuestQuiz={showGuestQuiz} />;
}
