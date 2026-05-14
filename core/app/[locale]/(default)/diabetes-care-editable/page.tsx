import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getArchiveHtmlParts } from '~/lib/archived-pages/archived-html-parts';
import { getMakeswiftPageMetadata, Page as MakeswiftPage } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

// Diabetes care page is **authored in Makeswift** at `/diabetes-care-editable`. Injects the
// SingleFile export `<head>` styles from `diabetes-care.html` so theme utilities apply. The hero
// **Diabetes care / Video with text overlay** is a native `<video>`. **Diabetes care / Custom band (logo + heading)**
// is an editable logo + two-line heading (with secondary color). **Diabetes care / Number counters** is an
// editable list of stats. **Diabetes care / Multicolumn** replaces export `multicolumn_JtTdUn` (up to four
// editable columns: image, heading, body, CTA). **Diabetes care / Reveal + story** replaces
// `reveal_image_with_text_iXk7GQ` and the upper rich-text block `rich_text_FWVbN6` (banner line, hero image,
// story heading, body, two CTAs). **Diabetes care / Timeline** replaces export `timeline_nyTDKQ` (carousel, bullets,
// CTA, image, bottom steps). **Diabetes care / Blog posts collage** replaces `blog_posts_collage_bTyfPm` (large featured post + two
// horizontal posts). **Diabetes care / Logo list** replaces `logo_list_BznDid` (heading + looping marquee of logos).
// **Diabetes care / Featured collections** replaces `featured_collections_gQLnyz` (tabs + product cards, same section CSS as the export).
// **Diabetes care / FAQ (first)** replaces `faq_VGRW8K`; **Diabetes care / FAQ (second)** replaces `faq_7B4B8U` (narrow + border vs plain + background; export section CSS).
// Remaining **Diabetes care / …** blocks are HTML slices from the export. Use
// **Stats band** when you want logo + heading + four stats together.
// Legacy full export: `/diabetes-care`.

// eslint-disable-next-line valid-jsdoc
/** Next.js metadata (Makeswift title/description when set, plus alternates). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const makeswiftMetadata = await getMakeswiftPageMetadata({
    path: '/diabetes-care-editable',
    locale,
  });

  return {
    title: makeswiftMetadata?.title ?? 'Diabetes care editable',
    ...(makeswiftMetadata?.description != null && { description: makeswiftMetadata.description }),
    alternates: await getMetadataAlternates({ path: '/diabetes-care-editable', locale }),
    robots: { index: false, follow: false },
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

export default async function DiabetesCareEditablePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { headStyles } = await getArchiveHtmlParts('diabetes-care.html');

  return (
    <>
      {headStyles.map((css, index) => (
        <style dangerouslySetInnerHTML={{ __html: css }} key={index} />
      ))}
      <MakeswiftPage locale={locale} path="/diabetes-care-editable" />
    </>
  );
}
