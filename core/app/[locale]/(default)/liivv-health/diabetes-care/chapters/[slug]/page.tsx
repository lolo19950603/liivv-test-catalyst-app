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
import { resolveSources } from '../../../_microsite/sources';
import { LANDING_GATES, PHARMACIST_CDE_REQUEST_HREF } from '../../landing-meta';
import { pathShelf, shopIdsForChapter } from '../chapter-shop';
import { DcChapterPage } from '../dc-chapter-page';
import { DcPathPage } from '../dc-path-page';
import { chapterSources, DC_REGISTER } from '../dc-register';
import { PATH_GATES, PATH_META, type PathSlug } from '../paths-meta';
import { getDiabetesPlacementItems } from '../placement-items';
import { DIABETES_SITE } from '../site';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

/*
 * Two kinds of page share this route. A slug in CHAPTER_META
 * (../chapters-meta.ts) is one of the six chapters the shared engine serves;
 * a slug in PATH_META (../paths-meta.ts) is one of the five path pages, the
 * reading lists generated from those chapters. Anything else is not found.
 *
 * The older chapter pages that used to answer here (chapters-data.ts) are
 * gone: New to the Journey and Every Day Living moved onto the engine, the
 * four type pages are path pages at the same URLs, and the "Your Diabetes
 * Journey" hub redirects to the landing's #which-diabetes (next.config.ts).
 */
const ENGINE_SLUGS: readonly string[] = chapterSlugs(DIABETES_SITE);

const isEngineSlug = (slug: string) => ENGINE_SLUGS.includes(slug);

const pathMeta = (slug: string) => PATH_META.find((meta) => meta.slug === slug);

export function generateStaticParams() {
  return [
    ...chapterStaticParams(DIABETES_SITE),
    ...locales.flatMap((locale) => PATH_META.map(({ slug }) => ({ locale, slug }))),
  ];
}

/* A path's title and lead, with the site's page-title suffix, as a chapter's are. */
async function pathMetadata(locale: string, slug: PathSlug): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `DiabetesCare.paths.${slug}` });
  const chrome = await getTranslations({ locale, namespace: 'DiabetesCare.ui.chapter' });

  return {
    title: `${t('title')} ${chrome('titleSuffix')}`,
    description: t('heroBody'),
    // French is populated (flagged as machine translated), so the alternate is truthful.
    alternates: await getMetadataAlternates({ path: chapterHref(DIABETES_SITE, slug), locale }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  if (isEngineSlug(slug)) {
    return chapterMetadata(DIABETES_SITE, locale, slug);
  }

  const path = pathMeta(slug);

  if (path) {
    return pathMetadata(locale, path.slug);
  }

  return { title: 'Chapter not found' };
}

/*
 * An engine chapter: the MedicalWebPage schema and the text-size pre-paint
 * (the `dc-text-size` key) go out with the server HTML, as on Ostomy's
 * chapters, and the page itself is the site's own client wrapper, which is
 * given only the slug. French is served as French: its prose carries the
 * draft marker every machine-translated chapter does, and the modules still
 * waiting on French review fall back to their plain lists (review-gates.ts).
 *
 * The products its cards place (../chapter-shop.ts) are read from the
 * catalogue here, for the page locale, and only those that can be bought
 * today are passed down (../placement-items.ts). So are the register entries
 * the chapter names, resolved for the page locale (../dc-register.ts), for
 * each card's Sources disclosure and the foot list (owner note 1).
 */
async function EngineChapter({ locale, slug }: { locale: string; slug: string }) {
  const chapter = await getLocalizedChapter(DIABETES_SITE, locale, slug);

  if (!chapter) {
    notFound();
  }

  const items = await getDiabetesPlacementItems(shopIdsForChapter(slug), locale);
  const { canonical } = await getMetadataAlternates({
    path: chapterHref(DIABETES_SITE, slug),
    locale,
    includeAlternates: false,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(chapterSchema(DIABETES_SITE, chapter, canonical, locale)),
        }}
        type="application/ld+json"
      />
      <script dangerouslySetInnerHTML={{ __html: textSizePrePaint(DIABETES_SITE) }} />
      <DcChapterPage items={items} slug={slug} sources={chapterSources(slug, locale)} />
    </>
  );
}

/*
 * A path page. Its sources are resolved here, for the page locale, so the
 * register stays out of the browser. The funding door renders once the
 * funding page exists, and the pharmacist band once its hold is lifted
 * (`cdeBand` in ../paths-meta.ts), with the CDE contact; until then its words
 * are not sent either. The band's "Request a call" waits on the landing's
 * `cdeRequestReason`, as every other one does.
 *
 * The shop strip between the reading list and the funding door is the path's
 * entry in PATH_SHELVES (../chapter-shop.ts); prediabetes has none, ever.
 */
async function PathRoute({ locale, slug }: { locale: string; slug: string }) {
  const meta = pathMeta(slug);

  if (!meta) {
    notFound();
  }

  const sources = resolveSources(DC_REGISTER, pathSourceIds(meta), locale);
  const introSources = resolveSources(DC_REGISTER, meta.introSources.flat(), locale);
  const fundingHref = LANDING_GATES.fundingPage
    ? localeHref(`${DIABETES_SITE.basePath}/funding`, locale)
    : null;
  const pharmacistBand = meta.pharmacist && PATH_GATES.cdeBand;
  const shelf = meta.slug === 'prediabetes' ? undefined : pathShelf(meta.slug);
  const items = shelf ? await getDiabetesPlacementItems(shelfProductIds(shelf), locale) : undefined;
  const pharmacistHref =
    pharmacistBand && LANDING_GATES.cdeRequestReason
      ? localeHref(PHARMACIST_CDE_REQUEST_HREF, locale)
      : null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: textSizePrePaint(DIABETES_SITE) }} />
      <DcPathPage
        fundingHref={fundingHref}
        introSources={introSources}
        pharmacistBand={pharmacistBand}
        pharmacistHref={pharmacistHref}
        shop={shelf && items ? { shelf, items } : null}
        slug={meta.slug}
        sources={sources}
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
