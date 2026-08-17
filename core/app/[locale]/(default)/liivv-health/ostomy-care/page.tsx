import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { shouldShowLandingQuiz } from '~/lib/onboarding/should-show-landing-quiz';

import { getOcCatalog } from './get-oc-catalog';
import { OstomyCarePage } from './ostomy-care-page';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Ostomy Care & Everyday "LIIVVing" | Liivv',
  description:
    'Ostomy supplies, everyday living support, and kind guidance — pouches, barriers, curated kits, and Ontario pharmacist chat.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const catalog = await getOcCatalog(locale);
  const { showQuiz, isSignedIn } = await shouldShowLandingQuiz('ostomy_care_everyday');

  return <OstomyCarePage catalog={catalog} isSignedIn={isSignedIn} showGuestQuiz={showQuiz} />;
}
