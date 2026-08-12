import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';

import { ChapterPage } from '../chapter-page';
import { CHAPTER_SLUGS, getChapter } from '../chapters-data';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => CHAPTER_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);

  if (!chapter) {
    return { title: 'Chapter not found' };
  }

  return {
    title: `${chapter.title} | Ostomy Care | Liivv`,
    description: chapter.heroBody,
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const chapter = getChapter(slug);

  if (!chapter) {
    notFound();
  }

  return <ChapterPage chapter={chapter} />;
}
