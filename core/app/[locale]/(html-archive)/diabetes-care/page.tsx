import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ArchiveHtmlReactBody } from '~/components/archived-html/archive-html-react-body';
import { getArchiveHtmlParts } from '~/lib/archived-pages/archived-html-parts';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getArchiveHtmlParts('diabetes-care.html');

  return {
    title,
    robots: { index: false, follow: false },
  };
}

export default async function DiabetesCareArchivedAsReactPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { headStyles, bodyInner } = await getArchiveHtmlParts('diabetes-care.html');

  return (
    <>
      {headStyles.map((css, index) => (
        // eslint-disable-next-line react/no-danger -- archived Shopify snapshot CSS from <head>
        <style dangerouslySetInnerHTML={{ __html: css }} key={index} />
      ))}
      <ArchiveHtmlReactBody html={bodyInner} />
    </>
  );
}
