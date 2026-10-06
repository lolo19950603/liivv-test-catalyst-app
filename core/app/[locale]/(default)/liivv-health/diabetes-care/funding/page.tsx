import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { localeHref } from '../../_microsite/chapters/hrefs';
import { landingCitations, uniqueCitations } from '../../_microsite/landing/compose';
import { shelfProductIds } from '../../_microsite/shop/shelves';
import { FUNDING_SHELF, PLACEMENTS_ON } from '../chapters/chapter-shop';
import { getDiabetesPlacementItems } from '../chapters/placement-items';
import { DIABETES_SITE } from '../chapters/site';
import { SOURCE_META, type SourceId } from '../chapters/sources-meta';
import { LANDING_GATES, PHARMACIST_CDE_REQUEST_HREF } from '../landing-meta';

import { DcFundingPage } from './dc-funding-page';
import type { FundingSourceLinks } from './funding-checker';
import { DIRECT_BILLING, PAGE_SOURCES, PRIVATE_FIRST, PROGRAM_META } from './funding-meta';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = `${DIABETES_SITE.basePath}/funding`;

/*
 * Funding & Coverage for Diabetes Care. The advertising signals are already
 * denied for everything under /liivv-health/diabetes-care by ../layout.tsx,
 * which also hands this page the DiabetesCare messages.
 *
 * No FAQPage or other JSON-LD, for the Ostomy funding page's reasons
 * (ostomy-care/funding/page.tsx).
 */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DiabetesCare.ui.fundingPage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // French is populated (flagged as machine translated), so the alternate is truthful.
    alternates: await getMetadataAlternates({ path: PATH, locale }),
  };
}

/*
 * Every register entry the page names, in page order: the provincial drug
 * plans billed directly, the programs (their first source is each card's
 * link) and the pages that print their phone numbers, the private-insurance
 * rules, then the page's own sentences. Resolved here, for the page locale,
 * so the register itself stays out of the browser; only these links are sent.
 */
const PAGE_SOURCE_IDS: SourceId[] = [
  ...DIRECT_BILLING.map((entry) => entry.source),
  ...PROGRAM_META.flatMap((meta) => [
    ...meta.sources,
    ...(meta.phones ?? []).map((group) => group.source),
  ]),
  ...Object.values(PRIVATE_FIRST).map((rule) => rule.source),
  ...Object.values(PAGE_SOURCES).flat(),
];

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  /*
   * A link to a page in the other language says so inside its own text, as
   * every chapter link does ("(en anglais)", `ui.chapter.shelf`), so one
   * destination is described the same way on every page.
   */
  const shelf = await getTranslations({ locale, namespace: 'DiabetesCare.ui.chapter.shelf' });
  const withLanguage = <T extends { label: string; hrefLang: string }>(link: T): T => {
    if (link.hrefLang === locale) return link;

    return {
      ...link,
      label: `${link.label} ${link.hrefLang === 'fr' ? shelf('inFrench') : shelf('inEnglish')}`,
    };
  };

  const citations = uniqueCitations([landingCitations(SOURCE_META, PAGE_SOURCE_IDS, locale)]).map(
    withLanguage,
  );
  const sources: FundingSourceLinks = Object.fromEntries(
    [...new Set(PAGE_SOURCE_IDS)].flatMap((id) => {
      const [link] = landingCitations(SOURCE_META, [id], locale);

      return link ? [[id, withLanguage(link)]] : [];
    }),
  );

  /* The pump-supplies strip after "How paying works" (../chapters/chapter-shop.ts). */
  const items = PLACEMENTS_ON
    ? await getDiabetesPlacementItems(shelfProductIds(FUNDING_SHELF), locale)
    : undefined;

  return (
    <DcFundingPage
      cdeRequestHref={
        LANDING_GATES.cdeRequestReason ? localeHref(PHARMACIST_CDE_REQUEST_HREF, locale) : null
      }
      citations={citations.map(({ label, href }) => ({ label, href }))}
      shop={items ? { shelf: FUNDING_SHELF, items } : null}
      sources={sources}
    />
  );
}
