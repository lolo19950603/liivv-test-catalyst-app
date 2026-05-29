import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer, FooterBottomBar, FooterContextProvider } from '~/components/footer';
import { Header } from '~/components/header';
import { DiabetesCareArchiveTheme } from '~/lib/archived-pages/diabetes-care-archive-theme';
import { SiteFeaturedColumnsFooter } from '~/lib/makeswift/components/site-featured-columns-footer';
import { SiteHeaderSlideshow } from '~/lib/makeswift/components/site-header-slideshow';
import { SiteFooterRevealShell } from '~/lib/makeswift/site-footer-group';

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
      <DiabetesCareArchiveTheme>
        <SiteHeaderSlideshow />
        <Header />

        <FooterContextProvider>
          <SiteFooterRevealShell
            featuredColumns={<SiteFeaturedColumnsFooter />}
            footer={<Footer />}
            footerBottom={<FooterBottomBar />}
          >
            <main role="main">{children}</main>
          </SiteFooterRevealShell>
        </FooterContextProvider>
      </DiabetesCareArchiveTheme>
    </>
  );
}
