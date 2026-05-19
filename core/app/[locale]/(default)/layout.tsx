import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { SiteHeaderSlideshow } from '~/lib/makeswift/components/site-header-slideshow';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      {/* Archived Shopify section theme (scoped ids; utility collisions stripped in build). */}
      <link href="/archive/diabetes-care-sections.css" rel="stylesheet" />
      <SiteHeaderSlideshow />
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}
