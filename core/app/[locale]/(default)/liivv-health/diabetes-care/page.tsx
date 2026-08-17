import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { shouldShowLandingQuiz } from '~/lib/onboarding/should-show-landing-quiz';

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
  const { showQuiz, isSignedIn } = await shouldShowLandingQuiz('diabetes_care_everyday');

  return (
    <DiabetesCarePage catalog={catalog} isSignedIn={isSignedIn} showGuestQuiz={showQuiz} />
  );
}
