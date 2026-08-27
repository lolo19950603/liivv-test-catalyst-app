import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { shouldShowLandingQuiz } from '~/lib/onboarding/should-show-landing-quiz';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { getOcCatalog } from './get-oc-catalog';
import { OstomyCarePage } from './ostomy-care-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = '/liivv-health/ostomy-care';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Ostomy Care & Everyday "Liivving" | Liivv',
    description:
      'Ostomy supplies, everyday living support, and kind guidance — pouches, barriers, curated kits, and Ontario pharmacist chat.',
    // includeAlternates is off deliberately. This microsite is hardcoded English
    // JSX, so /fr/ renders English — declaring an hreflang="fr" alternate would
    // tell search engines a French version exists when it does not. Turn this
    // back on the moment the copy moves into messages/ and is translated.
    alternates: await getMetadataAlternates({ path: PATH, locale, includeAlternates: false }),
  };
}

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
