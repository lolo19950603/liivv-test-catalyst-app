import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer, FooterBottomBar } from '~/components/footer';
import { Header } from '~/components/header';
import { LiveChatWidgetHost } from '~/components/virtual-care/live-chat-widget-host';
import './liivv-feature-buttons.css';
import './store-archive.css';

import { DiabetesCareArchiveTheme } from '~/lib/archived-pages/diabetes-care-archive-theme';
import { getStoreLogoFallback } from '~/lib/store-theme/get-store-logo-fallback';
import { StoreThemeProvider } from '~/lib/store-theme/store-theme';
import { SiteFeaturedColumnsFooter } from '~/lib/makeswift/components/site-featured-columns-footer';
import { SiteHeaderSlideshow } from '~/lib/makeswift/components/site-header-slideshow';
import { SiteFooterRevealShell } from '~/lib/makeswift/site-footer-group';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

function HeaderFallback() {
  return <div aria-hidden className="min-h-[4.5rem] w-full bg-[#faf8f3]" />;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const productImageFallbackLogo = await getStoreLogoFallback();

  return (
    <>
      {/* Archived Shopify section theme (scoped ids; utility collisions stripped in build). */}
      <link href="/archive/diabetes-care-sections.css" rel="stylesheet" />
      <DiabetesCareArchiveTheme>
        <StoreThemeProvider theme={{ productImageFallbackLogo }}>
          <Suspense fallback={null}>
            <SiteHeaderSlideshow />
          </Suspense>
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>

          <SiteFooterRevealShell
            featuredColumns={
              <Suspense fallback={null}>
                <SiteFeaturedColumnsFooter />
              </Suspense>
            }
            footer={
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            }
            footerBottom={
              <Suspense fallback={null}>
                <FooterBottomBar />
              </Suspense>
            }
          >
            <main className="liivv-store" role="main">
              {children}
            </main>
          </SiteFooterRevealShell>
          <LiveChatWidgetHost />
        </StoreThemeProvider>
      </DiabetesCareArchiveTheme>
    </>
  );
}
