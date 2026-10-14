import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { resolveSource, resolveSourceMap, resolveSources } from '../../_microsite/sources';
import { SA_REGISTER } from '../chapters/sa-register';
import { SLEEP_SITE } from '../chapters/site';
import type { SourceId } from '../chapters/sources-meta';

import type { FundingSourceLinks } from './funding-checker';
import {
  BUY_FIRST_ITEMS,
  CHECKING_CARDS,
  PAGE_SOURCES,
  PROGRAM_META,
  PROVINCE_CAUTION,
} from './funding-meta';
import { SaFundingPage } from './sa-funding-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = `${SLEEP_SITE.basePath}/funding`;

/*
 * Funding & Coverage for Sleep Apnea Care. The advertising signals are
 * already denied for everything under /liivv-health/sleep-apnea-care by
 * ../layout.tsx, which also hands this page the SleepApneaCare messages (with
 * the held program words left out) and, while SLEEP_APNEA_CARE_LIVE is false,
 * `noindex, nofollow`.
 *
 * No FAQPage or other JSON-LD, and no products: the page places nothing
 * (funding.md A.2) and makes no catalogue request.
 */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SleepApneaCare.ui.fundingPage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // French is populated (flagged as machine translated), so the alternate is truthful.
    alternates: await getMetadataAlternates({ path: PATH, locale }),
  };
}

/*
 * Every register entry the page names, in page order: the programs (their
 * first source is each card's link) and the pages that print their phone
 * numbers or list their offices, the province caution cards, the "still
 * checking" cards, then the page's own sentences. Resolved here, for the
 * page locale, so the register itself stays out of the browser.
 */
const PAGE_SOURCE_IDS: SourceId[] = [
  ...PROGRAM_META.flatMap((meta) => [
    ...meta.sources,
    ...(meta.phones ?? []).map((group) => group.source),
    ...(meta.contactSource ? [meta.contactSource] : []),
  ]),
  ...Object.values(PROVINCE_CAUTION).flatMap((caution) => [
    ...caution.sources,
    ...(caution.phones ?? []).map((group) => group.source),
  ]),
  ...CHECKING_CARDS.flatMap((card) => card.sources),
  ...BUY_FIRST_ITEMS.flatMap((item) => item.sources),
  ...Object.values(PAGE_SOURCES).flat(),
];

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  /*
   * A program's official page is linked as every Sources entry is (owner note
   * 1): "Title, Publisher (year)", and, where the page it opens is in the
   * other language, the language note inside its own text.
   */
  const shelf = await getTranslations({ locale, namespace: 'SleepApneaCare.ui.chapter.shelf' });
  const links: FundingSourceLinks = Object.fromEntries(
    [...new Set(PAGE_SOURCE_IDS)].flatMap((id) => {
      const source = resolveSource(SA_REGISTER, id, locale);

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
    <SaFundingPage
      links={links}
      pageSources={resolveSources(SA_REGISTER, PAGE_SOURCE_IDS, locale)}
      sources={resolveSourceMap(SA_REGISTER, Object.values(PAGE_SOURCES).flat(), locale)}
    />
  );
}
