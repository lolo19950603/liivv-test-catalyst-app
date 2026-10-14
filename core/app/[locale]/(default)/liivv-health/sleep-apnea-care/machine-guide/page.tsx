import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { collectSourceIds, resolveSourceMap, resolveSources } from '../../_microsite/sources';
import { SA_REGISTER } from '../chapters/sa-register';
import { SLEEP_SITE } from '../chapters/site';

import { CHART_A, CHART_B } from './machine-guide-data';
import { MACHINE_GUIDE } from './machine-guide-meta';
import { SaMachineGuidePage } from './sa-machine-guide-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = `${SLEEP_SITE.basePath}/machine-guide`;

/*
 * The machine guide (ruling N2; D13 option 1: its own page). Linked from
 * nowhere while LANDING_GATES.machineGuideLinked is false (../landing-meta.ts),
 * and, like every page under ../layout.tsx, noindex while the section is not
 * live. Advertising signals are denied for the whole section by the layout.
 *
 * No products and no catalogue request: Liivv sells no machine (N1).
 */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SleepApneaCare.machineGuide' });
  const chrome = await getTranslations({ locale, namespace: 'SleepApneaCare.ui.chapter' });

  return {
    title: `${t('title')} ${chrome('titleSuffix')}`,
    description: t('intro'),
    // French is populated (flagged as machine translated), so the alternate is truthful.
    alternates: await getMetadataAlternates({ path: PATH, locale }),
  };
}

/*
 * Every register entry the page names, in page order: the chart's cells (and
 * the licence and recall pages their numbers link), the ADP note and the
 * footnote, then the cards and their two outward links. Resolved here, for
 * the page locale, so the register itself stays out of the browser.
 */
const SOURCE_IDS: string[] = [
  ...collectSourceIds(CHART_A),
  ...CHART_A.flatMap((row) =>
    [row.type, row.prescriber, row.licence, row.recall].flatMap((cell) =>
      (cell?.links ?? []).map((link) => link.source),
    ),
  ),
  ...collectSourceIds(CHART_B),
  ...MACHINE_GUIDE.chart.adpNoteSources,
  ...MACHINE_GUIDE.chart.sources,
  ...MACHINE_GUIDE.cards.flatMap((card) => [
    ...card.sources,
    ...(card.links ?? []).map((link) => link.source),
  ]),
];

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <SaMachineGuidePage
      pageSources={resolveSources(SA_REGISTER, SOURCE_IDS, locale)}
      sources={resolveSourceMap(SA_REGISTER, SOURCE_IDS, locale)}
    />
  );
}
