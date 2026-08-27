import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { MedicalWebPage, WithContext } from 'schema-dts';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { ChapterPage } from '../chapter-page';
import { type Chapter, CHAPTER_SLUGS, getChapter } from '../chapters-data';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

function chapterPath(slug: string) {
  return `/liivv-health/ostomy-care/chapters/${slug}`;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => CHAPTER_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const chapter = getChapter(slug);

  if (!chapter) {
    return { title: 'Chapter not found' };
  }

  return {
    title: `${chapter.title} | Ostomy Care | Liivv`,
    description: chapter.heroBody,
    // includeAlternates is off deliberately — see the note in ../../page.tsx.
    // Chapter copy is hardcoded English, so /fr/ serves English.
    alternates: await getMetadataAlternates({
      path: chapterPath(slug),
      locale,
      includeAlternates: false,
    }),
  };
}

/*
 * MedicalWebPage rather than Article: this is reference material about a health
 * condition, and the type lets us declare the review status honestly — an
 * unreviewed chapter simply omits `reviewedBy` instead of claiming sign-off.
 */
function buildChapterSchema(chapter: Chapter, url: string): WithContext<MedicalWebPage> {
  const { governance } = chapter;
  const reviewed = Boolean(governance.reviewedBy) && Boolean(governance.reviewedOn);

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: chapter.title,
    description: chapter.heroBody,
    url,
    inLanguage: 'en-CA',
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
        name: governance.reviewedBy,
        ...(governance.credential && { honorificSuffix: governance.credential }),
      },
    }),
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const chapter = getChapter(slug);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildChapterSchema(chapter, canonical)) }}
        type="application/ld+json"
      />
      <ChapterPage chapter={chapter} />
    </>
  );
}
