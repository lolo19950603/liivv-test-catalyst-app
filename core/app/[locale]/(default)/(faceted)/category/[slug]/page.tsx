import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createLoader, SearchParams } from 'nuqs/server';
import { cache, Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import {
  isOstomyCategoryId,
  SHOP_OSTOMY_CARE_CATEGORY_ID,
} from '~/app/[locale]/(default)/liivv-health/ostomy-care/oc-ids';
import {
  OstomyShop,
  OstomyShopFallback,
} from '~/app/[locale]/(default)/liivv-health/ostomy-care/ostomy-shop';
import { OstomyShopPageScroll } from '~/app/[locale]/(default)/liivv-health/ostomy-care/ostomy-shop-page-scroll';
import { getSessionCustomerAccessToken } from '~/auth';
import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { numberedPaginationTransformer } from '~/data-transformers/numbered-pagination-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getSensitiveProductIds } from '~/lib/analytics/get-sensitive-product-ids';
import { categoryLineageIds, isSensitiveProduct } from '~/lib/analytics/sensitive-products';
import { withoutInsulinOnFrench } from '~/lib/checkout/quebec-insulin';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { resolveStoreLogo } from '~/lib/makeswift/site-header/resolve-store-logo';
import { Slot } from '~/lib/makeswift/slot';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts } from '../../fetch-compare-products';
import {
  DEFAULT_FACETED_PAGE_SIZE,
  getFacetedPageSizeOptions,
} from '../../faceted-page-size';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { CategoryScrollReset } from './_components/category-scroll-reset';
import { CategorySearchPanel } from './_components/category-search-panel';
import { CategoryViewed } from './_components/category-viewed';
import { OstomyShelfExit } from './_components/ostomy-shelf-exit';
import { getCategoryPageData } from './page-data';
import { getFacetedProductCardQuickActions } from '../../_actions/get-product-card-quick-actions';

const getCachedCategory = cache((categoryId: number) => {
  return {
    category: categoryId,
  };
});

const compareLoader = createCompareLoader();

const createCategorySearchParamsLoader = cache(
  async (categoryId: number, customerAccessToken?: string) => {
    const cachedCategory = getCachedCategory(categoryId);
    const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);
    const categoryFacets = categorySearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const transformedCategoryFacets = await facetsTransformer({
      refinedFacets: categoryFacets,
      allFacets: categoryFacets,
      searchParams: {},
    });
    const categoryFilters = transformedCategoryFacets.filter((facet) => facet != null);
    const filterParsers = getFilterParsers(categoryFilters);

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
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const categoryId = Number(slug);

  const { category } = await getCategoryPageData(categoryId, customerAccessToken);

  if (!category) {
    return notFound();
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: category.path, locale });

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs);
  const categoryPath = breadcrumbs[breadcrumbs.length - 1]?.path;

  return {
    title: makeswiftMetadata?.title || pageTitle || category.name,
    ...((makeswiftMetadata?.description || metaDescription) && {
      description: makeswiftMetadata?.description || metaDescription,
    }),
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(categoryPath && {
      alternates: await getMetadataAlternates({ path: categoryPath, locale }),
    }),
  };
}

export default async function Category(props: Props) {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  setRequestLocale(locale);

  const [t, tHeader] = await Promise.all([
    getTranslations('Faceted'),
    getTranslations('Components.Header'),
  ]);
  const quickActions = await getFacetedProductCardQuickActions();

  const categoryId = Number(slug);

  const { category, settings, categoryTree } = await getCategoryPageData(
    categoryId,
    customerAccessToken,
  );

  if (!category) {
    return notFound();
  }

  const categoryTrail = removeEdgesAndNodes(category.breadcrumbs);

  const breadcrumbs = categoryTrail.map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  /*
   * The ids that decide whether this shelf is health-revealing: its own and
   * every ancestor above it. A shelf under "Ostomy Care" is an ostomy shelf
   * whether or not its id was written down months ago, so the answer is the
   * same one on the server (the ad-signal flag below) and in the browser (the
   * view_item_list event).
   */
  const analyticsCategoryIds = categoryLineageIds(category.entityId, categoryTrail);

  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  const storeLogo = settings ? logoTransformer(settings) : '';
  const fallbackLogo = resolveStoreLogo(storeLogo, tHeader('home'));

  const streamableFacetedSearch = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const currencyCode = await getPreferredCurrencyCode();

    const loadSearchParams = await createCategorySearchParamsLoader(
      categoryId,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

    return fetchFacetedSearch(
      {
        ...searchParams,
        ...parsedSearchParams,
        category: categoryId,
      },
      currencyCode,
      customerAccessToken,
    );
  });

  /*
   * A product can be an ostomy item by a category this shelf is not: a skin
   * barrier wipe sits in wound care and in ostomy skin care at once, and its
   * own page already refuses to name it. The product cards on a shelf carry no
   * categories, so the answer comes from the catalogue by id — the same
   * id-only lookup the cart, compare and wishlist pages make — rather than
   * from a heavier card fragment every category page would pay for.
   */
  const streamableSensitiveProductIds = Streamable.from(async () => {
    const search = await streamableFacetedSearch;
    const sensitive = await getSensitiveProductIds(search.products.items.map((p) => p.entityId));

    return [...sensitive];
  });

  /*
   * The shelf's products: never insulin on /fr (owner answer B11;
   * ~/lib/checkout/quebec-insulin).
   */
  const streamableListedProducts = Streamable.from(async () => {
    const search = await streamableFacetedSearch;

    return withoutInsulinOnFrench(search.products.items, locale);
  });

  const streamableProducts = Streamable.from(async () => {
    const format = await getFormatter();

    const products = await streamableListedProducts;

    const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
      settings?.inventory ?? {};

    return productCardTransformer(
      products,
      format,
      showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
      showBackorderMessage,
    );
  });

  const streamableTotalCount = Streamable.from(async () => {
    const format = await getFormatter();
    const search = await streamableFacetedSearch;

    return format.number(search.products.collectionInfo?.totalItems ?? 0);
  });

  const streamablePagination = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const search = await streamableFacetedSearch;
    const limit = Number(searchParams.limit) || DEFAULT_FACETED_PAGE_SIZE;
    const page = Number(searchParams.page) || 1;
    const totalItems = search.products.collectionInfo?.totalItems ?? 0;

    return numberedPaginationTransformer(totalItems, limit, page);
  });

  const streamableFilters = Streamable.from(async () => {
    const searchParams = await props.searchParams;

    const loadSearchParams = await createCategorySearchParamsLoader(
      categoryId,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};
    const cachedCategory = getCachedCategory(categoryId);
    const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);
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

    const filters = transformedFacets.filter((facet) => facet != null);

    const tree = categoryTree[0];
    const subCategoriesFilters =
      tree == null || tree.children.length === 0
        ? []
        : [
            {
              type: 'link-group' as const,
              label: t('Category.subCategories'),
              links: tree.children.map((child) => ({
                label: child.name,
                href: child.path,
              })),
            },
          ];

    return [...subCategoriesFilters, ...filters];
  });

  const streamableCompareProducts = Streamable.from(async () => {
    const searchParams = await props.searchParams;

    if (!productComparisonsEnabled) {
      return [];
    }

    const { compare } = compareLoader(searchParams);

    const compareIds = { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };

    const products = await getCompareProducts(compareIds, customerAccessToken);

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      href: product.path,
    }));
  });

  const isShopOstomy = categoryId === SHOP_OSTOMY_CARE_CATEGORY_ID;
  const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
    settings?.inventory ?? {};

  return (
    <>
      <CategoryScrollReset />
      {/*
        An ostomy shelf — /liivv-health/ostomy-care/shop-ostomy-care, or any of
        the Heal + Manage ostomy categories — says what the person browsing it
        is dealing with. The advertising signals go off (~/lib/analytics/ad-signals).
      */}
      {isSensitiveProduct({ categoryIds: analyticsCategoryIds }) && <DenyAdSignals />}
      {/*
        The same shelves, for a different reason: an ostomy shelf was the only
        ostomy URL with no route to Chapter 02's red-flag list. See
        ./_components/ostomy-shelf-exit.
      */}
      {isOstomyCategoryId(categoryId) ? <OstomyShelfExit locale={locale} /> : null}
      <Slot
        label={`${category.name} top content`}
        snapshotId={`category-${categoryId}-top-content`}
      />
      {isShopOstomy ? (
        <div id="ostomy-shop-anchor">
          <Suspense fallback={null}>
            <OstomyShopPageScroll />
          </Suspense>
          <Suspense fallback={<OstomyShopFallback />}>
            <OstomyShop
              breadcrumbs={breadcrumbs}
              category={category}
              categoryIds={analyticsCategoryIds}
              fallbackLogo={fallbackLogo}
              outOfStockMessage={
                showOutOfStockMessage ? defaultOutOfStockMessage : undefined
              }
              quickActions={quickActions}
              searchParams={props.searchParams}
              showBackorderMessage={showBackorderMessage}
            />
          </Suspense>
        </div>
      ) : (
        <ProductsListSection
          breadcrumbs={breadcrumbs}
          compareLabel={t('Compare.compare')}
          fallbackLogo={fallbackLogo}
          compareProducts={streamableCompareProducts}
          emptyStateSubtitle={t('Category.Empty.subtitle')}
          emptyStateTitle={t('Category.Empty.title')}
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
          searchPanel={
            <CategorySearchPanel
              categoryEntityId={categoryId}
              categoryPath={category.path}
              fallbackLogo={fallbackLogo}
              searchPlaceholder={t('Category.searchPlaceholder', { categoryName: category.name })}
            />
          }
          title={category.name}
          totalCount={streamableTotalCount}
        />
      )}
      <Slot
        label={`${category.name} bottom content`}
        snapshotId={`category-${categoryId}-bottom-content`}
      />
      {isShopOstomy ? null : (
        <Stream value={Streamable.all([streamableListedProducts, streamableSensitiveProductIds])}>
          {([listedProducts, sensitiveProductIds]) => (
            <CategoryViewed
              category={category}
              categoryIds={analyticsCategoryIds}
              products={listedProducts}
              sensitiveProductIds={sensitiveProductIds}
            />
          )}
        </Stream>
      )}
    </>
  );
}
