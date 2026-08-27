import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { FAQPage, WithContext } from 'schema-dts';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { FundingPage } from './funding-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = '/liivv-health/ostomy-care/funding';

const TITLE = 'Ostomy funding in Canada — what your province covers | Liivv';
const DESCRIPTION =
  'What each province and territory pays toward ostomy supplies, how to apply, who has to sign off, and the federal tax credits worth claiming. Every figure links to its official source.';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: TITLE,
    description: DESCRIPTION,
    // includeAlternates off deliberately — this copy is hardcoded English, so
    // /fr/ serves English and an hreflang="fr" alternate would be a false claim.
    alternates: await getMetadataAlternates({ path: PATH, locale, includeAlternates: false }),
  };
}

/*
 * FAQPage rather than MedicalWebPage: this is money and process, not clinical
 * content, and these are the questions people actually type into a search box.
 */
function buildFaqSchema(url: string): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    inLanguage: 'en-CA',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Canada have a national ostomy funding program?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Coverage for ostomy supplies is set province by province, and the amount, the model, and who approves it all change at the provincial border. Moving provinces resets your coverage entirely. Federal programs exist for specific groups — NIHB for registered First Nations and recognized Inuit — and the Disability Tax Credit is available nationally.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do ostomates qualify for the Disability Tax Credit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not automatically. Having an ostomy does not qualify you on its own, and a well-managed routine is often refused. The test is that you are unable to manage bowel or bladder function, or that it takes roughly three times longer than for someone of similar age without the impairment, at least 90% of the time, for a continuous 12 months — assessed with your appliances and routine already in place. Applications go through the eliminating category rather than life-sustaining therapy, and only a medical doctor or nurse practitioner can certify form T2201. It is still worth applying, because approval can be backdated and unlocks the RDSP and the Canada Disability Benefit. If refused, ostomy supplies remain claimable as medical expenses with no approval needed.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens if my ostomy funding runs out before the year does?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ask an NSWOC first — a better fit often means fewer changes and less waste, which can be worth more than extra funding. The free manufacturer support programs from Hollister, Coloplast, and Convatec provide samples and nurse access regardless of where you buy. Provincial disability and social assistance programs sometimes top up coverage, and local Ostomy Canada chapters know the regional landscape.',
        },
      },
    ],
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

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
      <FundingPage />
    </>
  );
}
