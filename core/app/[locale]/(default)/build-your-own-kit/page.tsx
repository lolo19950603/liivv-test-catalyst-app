import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { SearchParams } from 'nuqs/server';

import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { numberedPaginationTransformer } from '~/data-transformers/numbered-pagination-transformer';
import { getSessionCustomerAccessToken } from '~/auth';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { NumberedPagination } from '@/vibes/soul/primitives/numbered-pagination';
import { Streamable } from '@/vibes/soul/lib/streamable';

import {
  DEFAULT_FACETED_PAGE_SIZE,
} from '../(faceted)/faceted-page-size';
import { fetchFacetedSearch } from '../(faceted)/fetch-faceted-search';

import { KitBuilder, type KitBuilderProduct } from './_components/kit-builder';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Faceted.BuildYourOwnKit' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function BuildYourOwnKitPage(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Faceted.BuildYourOwnKit');
  const format = await getFormatter();
  const searchParams = await props.searchParams;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();

  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || DEFAULT_FACETED_PAGE_SIZE;

  const search = await fetchFacetedSearch(
    {
      ...searchParams,
      ...(searchTerm ? { term: searchTerm } : {}),
      sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'featured',
    },
    currencyCode,
    customerAccessToken,
  );

  const products: KitBuilderProduct[] = search.products.items.map((product) => {
    const unitPrice = product.prices?.salePrice?.value ?? product.prices?.price.value ?? 0;
    const code = product.prices?.price.currencyCode ?? currencyCode ?? 'USD';

    return {
      id: product.entityId.toString(),
      productEntityId: product.entityId,
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(product.prices, format),
      unitPrice,
      currencyCode: code,
      sku: product.sku,
    };
  });

  const totalItems = search.products.collectionInfo?.totalItems ?? 0;
  const paginationInfo = numberedPaginationTransformer(totalItems, limit, page);

  const emptyTitle = searchTerm
    ? t('Empty.searchTitle', { term: searchTerm })
    : t('Empty.browseTitle');
  const emptySubtitle = searchTerm ? t('Empty.searchSubtitle') : t('Empty.browseSubtitle');

  return (
    <>
      <KitBuilder
        emptySubtitle={emptySubtitle}
        emptyTitle={emptyTitle}
        products={products}
        searchTerm={searchTerm}
        totalCountLabel={t('productCount', { count: format.number(totalItems) })}
      />
      <div className="mx-auto max-w-7xl px-4 pb-12 lg:px-6">
        <NumberedPagination
          info={Streamable.from(() => Promise.resolve(paginationInfo))}
          label={t('paginationLabel')}
          nextLabel={t('paginationNext')}
        />
      </div>
    </>
  );
}
