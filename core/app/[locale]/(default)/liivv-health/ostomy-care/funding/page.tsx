import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { FundingPage } from './funding-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = '/liivv-health/ostomy-care/funding';

/*
 * This page used to emit FAQPage JSON-LD. It has been removed rather than
 * translated, for two reasons.
 *
 * Google restricted FAQ rich results to government and health-authority sites
 * in August 2023, so a commercial site wins nothing from it. And the three
 * questions were hardcoded English with inLanguage 'en-CA' regardless of route,
 * so the French page was declaring English Q&A content — while the answers
 * existed on the page only in paraphrase, which is not the visible-content
 * match the format requires.
 *
 * If the accordion is wanted for readers, render it from messages/*.json so the
 * French is true as well, and add the schema back then.
 */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'OstomyCare.ui.fundingPage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // French is populated, so the alternate is truthful.
    alternates: await getMetadataAlternates({ path: PATH, locale }),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <FundingPage />;
}
