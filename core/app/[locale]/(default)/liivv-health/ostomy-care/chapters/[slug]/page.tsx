import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { MedicalWebPage, WithContext } from 'schema-dts';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { ChapterPage } from '../chapter-page';
import { buildChapters, type Chapter, CHAPTER_SLUGS } from '../chapters-data';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

function chapterPath(slug: string) {
  return `/liivv-health/ostomy-care/chapters/${slug}`;
}

/* Compose the chapter for this locale so metadata and JSON-LD match the page. */
async function getLocalizedChapter(locale: string, slug: string): Promise<Chapter | undefined> {
  const messages = await getMessages({ locale });

  return buildChapters(messages.OstomyCare.chapters).find((chapter) => chapter.slug === slug);
}

export function generateStaticParams() {
  return locales.flatMap((locale) => CHAPTER_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const chapter = await getLocalizedChapter(locale, slug);

  if (!chapter) {
    return { title: 'Chapter not found' };
  }

  return {
    title: `${chapter.title} | Ostomy Care | Liivv`,
    description: chapter.heroBody,
    alternates: await getMetadataAlternates({ path: chapterPath(slug), locale }),
  };
}

/*
 * MedicalWebPage rather than Article: this is reference material about a health
 * condition, and the type lets us declare the review status honestly — an
 * unreviewed chapter simply omits `reviewedBy` instead of claiming sign-off.
 */
function buildChapterSchema(
  chapter: Chapter,
  url: string,
  locale: string,
): WithContext<MedicalWebPage> {
  const { governance } = chapter;

  // Gated identically to the visible byline, including the English-only rule.
  // This asserts clinical review machine-readably and indexably, so it must
  // never outlive or overreach what the page itself says.
  const reviewed =
    Boolean(governance.name) &&
    Boolean(governance.reviewedOn) &&
    Boolean(governance.disclosure) &&
    locale === 'en';

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: chapter.title,
    description: chapter.heroBody,
    url,
    inLanguage: locale === 'fr' ? 'fr-CA' : 'en-CA',
    audience: {
      '@type': 'Patient',
      name: 'People living with an ostomy, and the people who care for them',
    },
    about: {
      '@type': 'MedicalCondition',
      name: 'Ostomy',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Liivv',
    },
    ...(reviewed && {
      lastReviewed: governance.reviewedOn,
      reviewedBy: {
        '@type': 'Person',
        name: governance.name,
        ...(governance.credential && { honorificSuffix: governance.credential }),
      },
    }),
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  if (!CHAPTER_SLUGS.includes(slug)) {
    notFound();
  }

  const chapter = await getLocalizedChapter(locale, slug);

  if (!chapter) {
    notFound();
  }

  const { canonical } = await getMetadataAlternates({
    path: chapterPath(slug),
    locale,
    includeAlternates: false,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildChapterSchema(chapter, canonical, locale)),
        }}
        type="application/ld+json"
      />
      <ChapterPage slug={slug} />
    </>
  );
}
