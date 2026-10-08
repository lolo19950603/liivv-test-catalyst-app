import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { localeHref } from '../../_microsite/chapters/hrefs';
import { resolveSource, resolveSources } from '../../_microsite/sources';
import { DC_REGISTER } from '../chapters/dc-register';
import { DIABETES_SITE } from '../chapters/site';
import type { SourceId } from '../chapters/sources-meta';
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
 *
 * No products: the owner removed the pump-supplies strip from this page on
 * 2026-10-07 (note 7), so it makes no catalogue request. The same strip stays
 * on Your Tools card 13.
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
   * A program's official page is linked as every Sources entry is (owner note
   * 1, 2026-10-07): "Title, Publisher (year)", and, where the page it opens
   * is in the other language, the language note inside its own text, as
   * every chapter link does ("(en anglais)", `ui.chapter.shelf`), so one
   * destination is described the same way on every page.
   */
  const shelf = await getTranslations({ locale, namespace: 'DiabetesCare.ui.chapter.shelf' });
  const sources: FundingSourceLinks = Object.fromEntries(
    [...new Set(PAGE_SOURCE_IDS)].flatMap((id) => {
      const source = resolveSource(DC_REGISTER, id, locale);

      if (!source) return [];

      const year = source.year === undefined ? '' : ` (${source.year})`;
      const note =
        source.hrefLang === locale
          ? ''
          : ` ${source.hrefLang === 'fr' ? shelf('inFrench') : shelf('inEnglish')}`;

      return [
        [
          id,
          {
            label: `${source.title}, ${source.publisher}${year}${note}`,
            href: source.href,
            hrefLang: source.hrefLang,
          },
        ],
      ];
    }),
  );

  return (
    <DcFundingPage
      cdeRequestHref={
        LANDING_GATES.cdeRequestReason ? localeHref(PHARMACIST_CDE_REQUEST_HREF, locale) : null
      }
      pageSources={resolveSources(DC_REGISTER, PAGE_SOURCE_IDS, locale)}
      sources={sources}
    />
  );
}
