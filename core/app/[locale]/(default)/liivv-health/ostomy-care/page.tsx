import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { FAQPage, WithContext } from 'schema-dts';

import { locales } from '~/i18n/locales';
import { shouldShowLandingQuiz } from '~/lib/onboarding/should-show-landing-quiz';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { getOcCatalog } from './get-oc-catalog';
import { OstomyCarePage } from './ostomy-care-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = '/liivv-health/ostomy-care';

/*
 * Mirrors the five questions rendered in the FAQ section of ostomy-care-page.tsx.
 * Keep the two in step — structured data that disagrees with the visible page is
 * worse than none, and Google treats it as a quality signal either way.
 */
const FAQS = [
  {
    q: 'How often should I empty or change my ostomy pouch?',
    a: 'Empty drainable pouches at around one-third to one-half full. Full system changes are often every few days, or sooner if you feel burning, itching, or a leak. Your NSWOC can help you find a wear time that suits your body — wear time varies a great deal between people and is not something to judge yourself against.',
  },
  {
    q: 'Can I customize an ostomy kit?',
    a: 'Yes. Start from a curated kit, adjust the quantities, add anything that was missing, and save your version — or subscribe so the restock keeps arriving on your own schedule.',
  },
  {
    q: 'How do ostomy supply subscriptions work?',
    a: 'On a product page, choose Subscribe and save, pick a frequency that matches your wear time, then check out as normal. Skip a delivery when you still have extras — there is no charge and nothing ships. Pause, skip, or cancel any time under Account, then Subscriptions.',
  },
  {
    q: 'What belongs in an ostomy go-bag?',
    a: 'A spare barrier and pouch, soft wipes, disposal bags, and any skin protectant or adhesive remover you use — plus spare underwear or a liner if that helps you feel ready to be out.',
  },
  {
    q: 'What can I ask a pharmacist about my ostomy?',
    a: 'Everyday product and restock questions, in Ontario during business hours until 5pm Eastern. Clinical concerns — fit, skin, and anything about the stoma itself — belong with your NSWOC or surgeon rather than a pharmacist.',
  },
];

function buildFaqSchema(url: string): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    inLanguage: 'en-CA',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question' as const,
      name: item.q,
      acceptedAnswer: { '@type': 'Answer' as const, text: item.a },
    })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Ostomy Care & Everyday "Liivving" | Liivv',
    description:
      'Ostomy supplies, everyday living support, and kind guidance — pouches, barriers, curated kits, and Ontario pharmacist chat.',
    // Still suppressed, unlike the chapters and the funding section. The chapter
    // cards on this page are translated, but the landing's own copy — hero, kits,
    // shop, subscribe, voices, FAQ — is still hardcoded English in
    // ostomy-care-page.tsx. Turn this on once that copy moves into messages/.
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
  const { canonical } = await getMetadataAlternates({
    path: PATH,
    locale,
    includeAlternates: false,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(canonical)) }}
        type="application/ld+json"
      />
      <OstomyCarePage catalog={catalog} isSignedIn={isSignedIn} showGuestQuiz={showQuiz} />
    </>
  );
}
