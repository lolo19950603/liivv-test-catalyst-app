import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { chapterSlugs } from '../../../_microsite/chapters/compose';
import { chapterHref, localeHref } from '../../../_microsite/chapters/hrefs';
import {
  chapterMetadata,
  chapterSchema,
  chapterStaticParams,
  getLocalizedChapter,
  textSizePrePaint,
} from '../../../_microsite/chapters/route';
import { pathSourceIds } from '../../../_microsite/paths/compose';
import { shelfProductIds } from '../../../_microsite/shop/shelves';
import { resolveSourceMap, resolveSources } from '../../../_microsite/sources';
import { LANDING_GATES } from '../../landing-meta';
import { pathShelf, shopIdsForChapter } from '../chapter-shop';
import { PATH_META, type PathSlug } from '../paths-meta';
import { getSleepPlacementItems } from '../placement-items';
import { SaChapterPage } from '../sa-chapter-page';
import { SaPathPage } from '../sa-path-page';
import { chapterSources, SA_REGISTER } from '../sa-register';
import { SLEEP_SITE } from '../site';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

/*
 * Two kinds of page share this route, as on Diabetes Care. A slug in
 * CHAPTER_META (../chapters-meta.ts) is one of the six chapters the shared
 * engine serves; a slug in PATH_META (../paths-meta.ts) is one of the six
 * path pages (cpap, bilevel, travel-cpap, oral-appliance, children,
 * not-diagnosed-yet), the reading lists generated from those chapters.
 * Anything else is not found.
 *
 * Every page here inherits `noindex, nofollow` from ../../layout.tsx while
 * SLEEP_APNEA_CARE_LIVE is false (../../launch.ts).
 */
const ENGINE_SLUGS: readonly string[] = chapterSlugs(SLEEP_SITE);

const isEngineSlug = (slug: string) => ENGINE_SLUGS.includes(slug);

const pathMeta = (slug: string) => PATH_META.find((meta) => meta.slug === slug);

/* A card the site holds (CategoryMeta `held`): a path lists nothing from it, sources included. */
const isHeldCard = (chapter: string, card: number) =>
  SLEEP_SITE.chapters.find((meta) => meta.slug === chapter)?.categories[card - 1]?.held !==
  undefined;

export function generateStaticParams() {
  return [
    ...chapterStaticParams(SLEEP_SITE),
    ...locales.flatMap((locale) => PATH_META.map(({ slug }) => ({ locale, slug }))),
  ];
}

/* A path's title and lead, with the site's page-title suffix, as a chapter's are. */
async function pathMetadata(locale: string, slug: PathSlug): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `SleepApneaCare.paths.${slug}` });
  const chrome = await getTranslations({ locale, namespace: 'SleepApneaCare.ui.chapter' });

  return {
    title: `${t('title')} ${chrome('titleSuffix')}`,
    description: t('heroBody'),
    // French is populated (flagged as machine translated), so the alternate is truthful.
    alternates: await getMetadataAlternates({ path: chapterHref(SLEEP_SITE, slug), locale }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  if (isEngineSlug(slug)) {
    return chapterMetadata(SLEEP_SITE, locale, slug);
  }

  const path = pathMeta(slug);

  if (path) {
    return pathMetadata(locale, path.slug);
  }

  return { title: 'Chapter not found' };
}

/*
 * An engine chapter: the MedicalWebPage schema and the text-size pre-paint
 * (the `sa-text-size` key) go out with the server HTML, and the page itself is
 * the site's own client wrapper, given the slug, the register entries the
 * chapter names (resolved for the page locale) and, once placements are on,
 * the products its cards place. French is served as French, flagged as
 * machine translated; modules still waiting on French review fall back to
 * their plain lists, and the red-flag block is never behind a gate.
 */
async function EngineChapter({ locale, slug }: { locale: string; slug: string }) {
  const chapter = await getLocalizedChapter(SLEEP_SITE, locale, slug);

  if (!chapter) {
    notFound();
  }

  const items = await getSleepPlacementItems(shopIdsForChapter(slug), locale);
  const { canonical } = await getMetadataAlternates({
    path: chapterHref(SLEEP_SITE, slug),
    locale,
    includeAlternates: false,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(chapterSchema(SLEEP_SITE, chapter, canonical, locale)),
        }}
        type="application/ld+json"
      />
      <script dangerouslySetInnerHTML={{ __html: textSizePrePaint(SLEEP_SITE) }} />
      <SaChapterPage items={items} slug={slug} sources={chapterSources(slug, locale)} />
    </>
  );
}

/*
 * A path page. Its sources are resolved here, for the page locale, so the
 * register stays out of the browser: the intro's (under the intro), each
 * entry's and the funding door's (on them, owner note 1), and the page's as
 * a whole (the foot list), leaving out any entry at a held card. The funding
 * door links the Funding & Coverage page (`fundingPage`). The support band is
 * never drawn (its words are out of tree until Part C).
 *
 * The shop strip is the path's entry in PATH_SHELVES (../chapter-shop.ts):
 * none while placements are off, and never on the reading-only paths.
 */
async function PathRoute({ locale, slug }: { locale: string; slug: string }) {
  const meta = pathMeta(slug);

  if (!meta) {
    notFound();
  }

  const listed = { ...meta, entries: meta.entries.filter((e) => !isHeldCard(e.chapter, e.card)) };
  const entryIds = listed.entries.flatMap((entry) => entry.sources ?? []);
  const shelf = pathShelf(meta.slug);
  const items = shelf ? await getSleepPlacementItems(shelfProductIds(shelf), locale) : undefined;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: textSizePrePaint(SLEEP_SITE) }} />
      <SaPathPage
        entrySources={resolveSourceMap(SA_REGISTER, entryIds, locale)}
        fundingHref={
          LANDING_GATES.fundingPage ? localeHref(`${SLEEP_SITE.basePath}/funding`, locale) : null
        }
        fundingSources={resolveSources(SA_REGISTER, meta.fundingSources, locale)}
        introSources={resolveSources(SA_REGISTER, meta.introSources.flat(), locale)}
        shop={shelf && items ? { shelf, items } : null}
        slug={meta.slug}
        sources={resolveSources(SA_REGISTER, pathSourceIds(listed), locale)}
      />
    </>
  );
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  if (isEngineSlug(slug)) {
    return <EngineChapter locale={locale} slug={slug} />;
  }

  return <PathRoute locale={locale} slug={slug} />;
}
