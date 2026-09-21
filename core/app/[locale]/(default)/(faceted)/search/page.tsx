import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createLoader, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { isOstomyKit } from '~/app/[locale]/(default)/liivv-health/ostomy-care/oc-ids';
import { getSessionCustomerAccessToken } from '~/auth';
import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { numberedPaginationTransformer } from '~/data-transformers/numbered-pagination-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getSensitiveProductIds } from '~/lib/analytics/get-sensitive-product-ids';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';

import { MAX_COMPARE_LIMIT } from '../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../fetch-compare-products';
import { DEFAULT_FACETED_PAGE_SIZE, getFacetedPageSizeOptions } from '../faceted-page-size';
import { fetchFacetedSearch } from '../fetch-faceted-search';

import { getSearchPageData } from './page-data';
import { getFacetedProductCardQuickActions } from '../_actions/get-product-card-quick-actions';

const compareLoader = createCompareLoader();

const createSearchSearchParamsLoader = cache(
  async (searchParams: SearchParams, customerAccessToken?: string) => {
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return null;
    }

    const search = await fetchFacetedSearch(searchParams, undefined, customerAccessToken);
    const searchFacets = search.facets.items;
    const transformedSearchFacets = await facetsTransformer({
      refinedFacets: searchFacets,
      allFacets: searchFacets,
      searchParams: {},
    });
    const searchFilters = transformedSearchFacets.filter((facet) => facet != null);
    const filterParsers = getFilterParsers(searchFilters);

    // If there are no filters, return `null`, since calling `createLoader` with an empty
    // object will throw the following cryptic error:
    //
    // ```
    // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
    //   See https://err.47ng.com/NUQS-500
    // ```
    if (Object.keys(filterParsers).length === 0) {
      return null;
    }

    return createLoader(filterParsers);
  },
);

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Faceted.Search' });
  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: '/search', locale });

  return {
    title: makeswiftMetadata?.title || t('title'),
    description: makeswiftMetadata?.description || undefined,
  };
}

export default async function Search(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Faceted');
  const quickActions = await getFacetedProductCardQuickActions();

  const { settings } = await getSearchPageData();

  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  const streamableFacetedSearch = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const loadSearchParams = await createSearchSearchParamsLoader(
      searchParams,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

    const search = await fetchFacetedSearch(
      {
        ...searchParams,
        ...parsedSearchParams,
      },
      currencyCode,
      customerAccessToken,
    );

    /*
     * =======================================================================
     * THE CURATED OSTOMY KITS ARE WITHHELD FROM SEARCH TOO
     * =======================================================================
     * Same withhold as the ostomy category shelf (`isOstomyKit` in
     * `category/[slug]/page.tsx`), for the same reason: under D11 every kit in
     * 8041–8048 is off every Ostomy Care surface until the K1 rebuilds land,
     * and five of them are withheld further for names that make a claim — "Skin
     * Shield (Peristomal Skin Health & Infection Prevention)", "Stay Hydrated
     * (High-Output & Dehydration Rescue)". A store search for "ostomy" listed
     * all eight as full product cards, with those exact names, which is the
     * thing the withhold exists to prevent.
     *
     * Unconditional here, unlike the category route. A result set has no
     * category to test — the reader's own term is the only context — so there
     * is no ostomy/not-ostomy question to ask, and a kit that must not be shown
     * on an ostomy shelf must not be shown in a search either.
     *
     * Residual, recorded rather than papered over, exactly as on the category
     * route: the facet counts, the total and the pagination come from
     * BigCommerce and still count the kits, so a page can show fewer cards than
     * its own count claims. The owner's step closes both — take 8041–8048 out
     * of the ostomy categories, or set is_visible = false — and then this
     * filter simply never matches. The kits' own product pages also stay live.
     * =======================================================================
     */
    const items = search.products.items.filter((product) => !isOstomyKit(product.entityId));

    if (items.length === search.products.items.length) {
      return search;
    }

    return { ...search, products: { ...search.products, items } };
  });

  /*
   * A search term is not a category, so the path and the id list are the only
   * things that can say this page is a health context — and `?term=ostomy` is
   * itself the health fact, carried in page_location. When the result set holds
   * a sensitive product the advertising signals go off for the page session,
   * the same way they do on an ostomy shelf. `getSensitiveProductIds` fails
   * closed, so a lookup that could not answer counts as sensitive.
   */
  const streamableDenyAdSignals = Streamable.from(async () => {
    const search = await streamableFacetedSearch;
    const sensitive = await getSensitiveProductIds(search.products.items.map((p) => p.entityId));

    return sensitive.size > 0;
  });

  const streamableProducts = Streamable.from(async () => {
    const format = await getFormatter();

    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return [];
    }

    const search = await streamableFacetedSearch;
    const products = search.products.items;

    const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
      settings?.inventory ?? {};

    return productCardTransformer(
      products,
      format,
      showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
      showBackorderMessage,
    );
  });

  const streamableTitle = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    return `${t('Search.searchResults')} "${searchTerm}"`;
  });

  const streamableTotalCount = Streamable.from(async () => {
    const format = await getFormatter();
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return format.number(0);
    }

    const search = await streamableFacetedSearch;

    return format.number(search.products.collectionInfo?.totalItems ?? 0);
  });

  const streamableEmptyStateTitle = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    return t('Search.Empty.title', { term: searchTerm });
  });

  const streamablePagination = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

    if (!searchTerm) {
      return numberedPaginationTransformer(0, DEFAULT_FACETED_PAGE_SIZE, 1);
    }

    const search = await streamableFacetedSearch;
    const limit = Number(searchParams.limit) || DEFAULT_FACETED_PAGE_SIZE;
    const page = Number(searchParams.page) || 1;
    const totalItems = search.products.collectionInfo?.totalItems ?? 0;

    return numberedPaginationTransformer(totalItems, limit, page);
  });

  const streamableFilters = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!searchTerm) {
      return [];
    }

    const loadSearchParams = await createSearchSearchParamsLoader(
      searchParams,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};
    const categorySearch = await fetchFacetedSearch({}, undefined, customerAccessToken);
    const refinedSearch = await streamableFacetedSearch;

    const allFacets = categorySearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const refinedFacets = refinedSearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );

    const transformedFacets = await facetsTransformer({
      refinedFacets,
      allFacets,
      searchParams: { ...searchParams, ...parsedSearchParams },
    });

    return transformedFacets.filter((facet) => facet != null);
  });

  const streamableCompareProducts = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!productComparisonsEnabled) {
      return [];
    }

    const { compare } = compareLoader(searchParams);

    const compareIds = { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };

    const products = await getCompareProductsData(compareIds, customerAccessToken);

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      href: product.path,
    }));
  });

  return (
    <>
      <Stream fallback={null} value={streamableDenyAdSignals}>
        {(sensitive) => (sensitive ? <DenyAdSignals /> : null)}
      </Stream>
      <ProductsListSection
        breadcrumbs={[
          { label: t('Search.Breadcrumbs.home'), href: '/' },
          { label: t('Search.Breadcrumbs.search'), href: `#` },
        ]}
        compareLabel={t('Compare.compare')}
        compareProducts={streamableCompareProducts}
        emptyStateSubtitle={t('Search.Empty.subtitle')}
        emptyStateTitle={streamableEmptyStateTitle}
        filterLabel={t('FacetedSearch.filters')}
        filters={streamableFilters}
        filtersPanelTitle={t('FacetedSearch.filters')}
        maxCompareLimitMessage={t('Compare.maxCompareLimit')}
        maxItems={MAX_COMPARE_LIMIT}
        pageSizeDefaultValue={DEFAULT_FACETED_PAGE_SIZE}
        pageSizeLabel={t('PageSize.show')}
        pageSizeOptions={getFacetedPageSizeOptions((count) =>
          t('PageSize.perPage', { count: String(count) }),
        )}
        paginationInfo={streamablePagination}
        paginationLabel={t('Pagination.label')}
        paginationNextLabel={t('Pagination.next')}
        products={streamableProducts}
        quickActions={quickActions}
        rangeFilterApplyLabel={t('FacetedSearch.Range.apply')}
        removeLabel={t('Compare.remove')}
        resetFiltersLabel={t('FacetedSearch.resetFilters')}
        showCompare={productComparisonsEnabled}
        showRating={showRating}
        sortDefaultValue="featured"
        sortLabel={t('SortBy.sortBy')}
        sortOptions={[
          { value: 'featured', label: t('SortBy.featuredItems') },
          { value: 'newest', label: t('SortBy.newestItems') },
          { value: 'best_selling', label: t('SortBy.bestSellingItems') },
          { value: 'a_to_z', label: t('SortBy.aToZ') },
          { value: 'z_to_a', label: t('SortBy.zToA') },
          { value: 'best_reviewed', label: t('SortBy.byReview') },
          { value: 'lowest_price', label: t('SortBy.priceAscending') },
          { value: 'highest_price', label: t('SortBy.priceDescending') },
          { value: 'relevance', label: t('SortBy.relevance') },
        ]}
        sortParamName="sort"
        title={streamableTitle}
        totalCount={streamableTotalCount}
      />
    </>
  );
}
