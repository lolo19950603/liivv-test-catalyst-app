import { Metadata } from 'next';
import { getFormatter, setRequestLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { HeaderLinksFragment } from '~/components/header/fragment';
import { locales } from '~/i18n/locales';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { mapCategoryTreeFromStore } from '~/lib/makeswift/site-header/map-category-tree';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { LiivvHomePage } from './home/liivv-home-page';
import {
  filterYourLifeProducts,
  findYourLifeRoot,
  mapHomeProducts,
  pickYourLifeCategories,
} from './home/map-home-catalog';
import { GetLinksAndSectionsQuery, getPageData } from './page-data';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Liivv Your Life | Shop everyday wellness',
    description:
      'Shop everyday essentials, manage prescriptions, CarePak, refills, subscriptions, and pharmacist chat — then explore Liivv Health when you need a deeper care story.',
    alternates: await getMetadataAlternates({ path: '/', locale }),
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [customerAccessToken, currencyCode, format] = await Promise.all([
    getSessionCustomerAccessToken(),
    getPreferredCurrencyCode(),
    getFormatter(),
  ]);

  const fetchOptions = customerAccessToken
    ? { cache: 'no-store' as const }
    : { next: { revalidate } };

  const [pageData, linksResponse] = await Promise.all([
    getPageData(currencyCode, customerAccessToken),
    client.fetch({
      document: GetLinksAndSectionsQuery,
      customerAccessToken,
      variables: { currencyCode },
      validateCustomerAccessToken: false,
      fetchOptions,
    }),
  ]);

  const siteLinks = readFragment(HeaderLinksFragment, linksResponse.data).site;
  const categoryTree = mapCategoryTreeFromStore(siteLinks.categoryTree);

  const categories = pickYourLifeCategories(categoryTree);
  const yourLifeRoot = findYourLifeRoot(categoryTree);
  const featured = mapHomeProducts(pageData.site.featuredProducts, format);
  const newest = filterYourLifeProducts(
    mapHomeProducts(pageData.site.newestProducts, format),
    categories,
    yourLifeRoot,
    24,
  );

  return <LiivvHomePage categories={categories} featured={featured} newest={newest} />;
}
