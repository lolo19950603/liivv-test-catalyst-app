import { getTranslations } from 'next-intl/server';

import { NotFound as NotFoundSection } from '@/vibes/soul/sections/not-found';
import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { DiabetesCareArchiveTheme } from '~/lib/archived-pages/diabetes-care-archive-theme';
import { StoreThemeProvider } from '~/lib/store-theme/store-theme';

import './(default)/store-archive.css';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <>
      <link href="/archive/diabetes-care-sections.css" rel="stylesheet" />
      <DiabetesCareArchiveTheme>
        <StoreThemeProvider>
          <Header />

          <main className="liivv-store flex flex-1 flex-col" role="main">
            <NotFoundSection
              className="flex-1 place-content-center"
              ctaLabel={t('search')}
              subtitle={t('subtitle')}
              title={t('title')}
            />
          </main>

          <Footer />
        </StoreThemeProvider>
      </DiabetesCareArchiveTheme>
    </>
  );
}
