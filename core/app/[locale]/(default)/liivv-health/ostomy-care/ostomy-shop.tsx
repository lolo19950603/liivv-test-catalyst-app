import { getLocale, getTranslations } from 'next-intl/server';
import type { SearchParams } from 'nuqs/server';
import { type ReactNode } from 'react';

import { NumberedPagination } from '@/vibes/soul/primitives/numbered-pagination';
import type {
  ArchiveCatalogProductCardQuickActions,
  ProductImageFallbackLogo,
} from '@/vibes/soul/primitives/product-card';
import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { DEFAULT_FACETED_PAGE_SIZE } from '@/vibes/soul/sections/products-list-section/constants';
import { PageSize } from '@/vibes/soul/sections/products-list-section/page-size';
import { Sorting } from '@/vibes/soul/sections/products-list-section/sorting';
import { CategoryViewed } from '~/app/[locale]/(default)/(faceted)/category/[slug]/_components/category-viewed';
import { getCategoryPageData } from '~/app/[locale]/(default)/(faceted)/category/[slug]/page-data';
import { getFacetedPageSizeOptions } from '~/app/[locale]/(default)/(faceted)/faceted-page-size';
import { Link } from '~/components/link';
import { numberedPaginationTransformer } from '~/data-transformers/numbered-pagination-transformer';
import { getSensitiveProductIds } from '~/lib/analytics/get-sensitive-product-ids';

import { SHOP_OSTOMY_HREF } from './chapters/chapters-data';
import { getOstomyShopCatalog } from './get-ostomy-shop';
import { OstomyShopResultsScroll } from './ostomy-shop-page-scroll';
import {
  countShelf,
  matchesShelf,
  type OpeningSize,
  orderedBrandNames,
  orderedSizes,
  type ShelfSelection,
  SHOP_KINDS,
  type ShopKind,
  sizeToken,
} from './shop-classify';
import {
  filtersAreActive,
  parseShopFilters,
  type ShopFilters,
  shopHref,
  toggleValue,
} from './shop-filters';

import './ostomy-shop.css';

type Category = NonNullable<Awaited<ReturnType<typeof getCategoryPageData>>['category']>;

const KIND_LABEL = {
  pouches: 'pouches',
  barriers: 'barriers',
  accessories: 'accessories',
  kits: 'kits',
} as const satisfies Record<ShopKind, 'pouches' | 'barriers' | 'accessories' | 'kits'>;

export function OstomyShopFallback() {
  return (
    <div aria-hidden className="os-fallback">
      <div className="os-wrap">
        <div className="os-fallback-title" />
        <div className="os-fallback-layout">
          <div className="os-fallback-side" />
          <div className="os-fallback-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="os-fallback-card" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function OstomyShop({
  breadcrumbs,
  category,
  categoryIds,
  fallbackLogo,
  outOfStockMessage,
  quickActions,
  searchParams,
  showBackorderMessage,
}: {
  breadcrumbs: Breadcrumb[];
  category: Category;
  categoryIds: readonly number[];
  fallbackLogo?: ProductImageFallbackLogo | null;
  outOfStockMessage?: string;
  quickActions: ArchiveCatalogProductCardQuickActions;
  searchParams: Promise<SearchParams>;
  showBackorderMessage?: boolean;
}) {
  const [locale, params, t, faceted] = await Promise.all([
    getLocale(),
    searchParams,
    getTranslations('OstomyCare.ui.shopPage'),
    getTranslations('Faceted'),
  ]);
  const filters = parseShopFilters(params);
  const path = category.path || SHOP_OSTOMY_HREF;
  const catalog = await getOstomyShopCatalog(
    locale,
    filters.sort,
    outOfStockMessage,
    showBackorderMessage,
  );
  const selection: ShelfSelection = {
    ...(filters.kind ? { kind: filters.kind } : {}),
    ...(filters.system ? { system: filters.system } : {}),
    brands: filters.brands,
    sizes: filters.sizes,
    ...(filters.term ? { term: filters.term } : {}),
  };
  const matched = catalog.products.filter((product) => matchesShelf(product, selection));
  const page = Math.min(filters.page, Math.max(1, Math.ceil(matched.length / filters.limit) || 1));
  const visible = matched.slice((page - 1) * filters.limit, page * filters.limit);
  const brands = orderedBrandNames(catalog.products.map((product) => product.brand));
  const sizes = orderedSizes(catalog.products.map((product) => product.size));
  const narrowed: ShelfSelection = {
    brands: filters.brands,
    sizes: filters.sizes,
    ...(filters.term ? { term: filters.term } : {}),
  };
  const active = filtersAreActive(filters);
  const clearHref = shopHref(path, filters, {
    kind: undefined,
    system: undefined,
    brands: [],
    sizes: [],
    term: undefined,
    page: 1,
  });
  const sensitiveProductIds = await getSensitiveProductIds(
    visible.map((product) => product.node.entityId),
  );

  return (
    <section aria-label={t('label')} id="ostomy-shop">
      <div className="os-wrap os-intro">
        {breadcrumbs.length > 1 ? <Breadcrumbs breadcrumbs={breadcrumbs} /> : null}
        <header className="os-head">
          <p className="os-eyebrow">{t('eyebrow')}</p>
          <h1>{category.name}</h1>
          <p className="os-lead">{t('description')}</p>
        </header>
      </div>

      <div className="os-wrap os-layout">
        <aside aria-label={t('filtersLabel')} className="os-side">
          <div className="os-filters">
            <FilterRow id="os-kind" label={t('kindLabel')}>
              <Chip
                count={countShelf(catalog.products, narrowed)}
                href={shopHref(path, filters, {
                  kind: undefined,
                  system: undefined,
                  page: 1,
                })}
                label={t('all')}
                pressed={filters.kind == null}
              />
              {SHOP_KINDS.map((kind) => (
                <Chip
                  count={countShelf(catalog.products, { ...narrowed, kind })}
                  href={shopHref(path, filters, { kind, system: undefined, page: 1 })}
                  key={kind}
                  label={t(KIND_LABEL[kind])}
                  pressed={filters.kind === kind}
                />
              ))}
            </FilterRow>

            {filters.kind === 'pouches' ? (
              <FilterRow id="os-system" label={t('systemLabel')}>
                <Chip
                  count={countShelf(catalog.products, { ...narrowed, kind: 'pouches' })}
                  href={shopHref(path, filters, { kind: 'pouches', system: undefined, page: 1 })}
                  label={t('anyPouch')}
                  pressed={filters.system == null}
                />
                <Chip
                  count={countShelf(catalog.products, {
                    ...narrowed,
                    kind: 'pouches',
                    system: 'one',
                  })}
                  href={shopHref(path, filters, { kind: 'pouches', system: 'one', page: 1 })}
                  label={t('onePiece')}
                  pressed={filters.system === 'one'}
                />
                <Chip
                  count={countShelf(catalog.products, {
                    ...narrowed,
                    kind: 'pouches',
                    system: 'two',
                  })}
                  href={shopHref(path, filters, { kind: 'pouches', system: 'two', page: 1 })}
                  label={t('twoPiece')}
                  pressed={filters.system === 'two'}
                />
              </FilterRow>
            ) : null}

            {brands.length > 0 ? (
              <FilterRow id="os-brand" label={t('brandLabel')}>
                <Chip
                  count={countShelf(catalog.products, { ...selection, brands: [] })}
                  href={shopHref(path, filters, { brands: [], page: 1 })}
                  label={t('allBrands')}
                  pressed={filters.brands.length === 0}
                />
                {brands.map((brand) => (
                  <Chip
                    count={countShelf(catalog.products, { ...selection, brands: [brand] })}
                    href={shopHref(path, filters, {
                      brands: toggleValue(filters.brands, brand),
                      page: 1,
                    })}
                    key={brand}
                    label={brand}
                    pressed={filters.brands.some(
                      (selected) => selected.toLowerCase() === brand.toLowerCase(),
                    )}
                  />
                ))}
              </FilterRow>
            ) : null}

            {sizes.length > 0 ? (
              <FilterRow id="os-size" label={t('sizeLabel')}>
                <Chip
                  count={countShelf(catalog.products, { ...selection, sizes: [] })}
                  href={shopHref(path, filters, { sizes: [], page: 1 })}
                  label={t('anySize')}
                  pressed={filters.sizes.length === 0}
                />
                {sizes.map((size) => {
                  const token = sizeToken(size);

                  return (
                    <Chip
                      count={countShelf(catalog.products, { ...selection, sizes: [token] })}
                      href={shopHref(path, filters, {
                        sizes: toggleValue(filters.sizes, token),
                        page: 1,
                      })}
                      key={token}
                      label={sizeLabel(size, t('cutToFit'))}
                      pressed={filters.sizes.includes(token)}
                    />
                  );
                })}
              </FilterRow>
            ) : null}
          </div>
        </aside>

        <div className="os-main">
          <form action="" className="os-search" method="get" role="search">
            <label className="os-search-label" htmlFor="ostomy-shop-search">
              {t('searchLabel')}
            </label>
            <input
              defaultValue={filters.term ?? ''}
              id="ostomy-shop-search"
              name="term"
              placeholder={t('searchPlaceholder')}
              type="search"
            />
            <FilterFields filters={filters} />
            <button type="submit">{t('searchSubmit')}</button>
          </form>

          <div className="os-meta">
            <p aria-live="polite" className="os-count">
              {t('results', { count: matched.length })}
            </p>
            {active ? (
              <Link className="os-clear" href={clearHref} scroll={false}>
                {t('clear')}
              </Link>
            ) : null}
            <div className="liivv-catalog-toolbar os-toolbar">
              <div className="liivv-catalog-toolbar__controls">
                <PageSize
                  defaultValue={filters.limit}
                  label={faceted('PageSize.show')}
                  options={getFacetedPageSizeOptions((count) =>
                    faceted('PageSize.perPage', { count: String(count) }),
                  )}
                />
                <Sorting
                  defaultValue={filters.sort}
                  label={faceted('SortBy.sortBy')}
                  options={[
                    { value: 'featured', label: faceted('SortBy.featuredItems') },
                    { value: 'newest', label: faceted('SortBy.newestItems') },
                    { value: 'best_selling', label: faceted('SortBy.bestSellingItems') },
                    { value: 'a_to_z', label: faceted('SortBy.aToZ') },
                    { value: 'z_to_a', label: faceted('SortBy.zToA') },
                    { value: 'best_reviewed', label: faceted('SortBy.byReview') },
                    { value: 'lowest_price', label: faceted('SortBy.priceAscending') },
                    { value: 'highest_price', label: faceted('SortBy.priceDescending') },
                    { value: 'relevance', label: faceted('SortBy.relevance') },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="os-results" id="ostomy-shop-results">
            <OstomyShopResultsScroll />
            {catalog.ok && visible.length > 0 ? (
              <ProductList
                cardVariant="archive"
                className="os-grid"
                fallbackLogo={fallbackLogo}
                products={visible.map((product) => product.card)}
                quickActions={quickActions}
                showCompare={false}
              />
            ) : (
              <div className="os-empty">
                <p>{catalog.ok ? t('empty') : t('unavailable')}</p>
                {catalog.ok && active ? (
                  <Link className="os-clear" href={clearHref}>
                    {t('emptyAction')}
                  </Link>
                ) : null}
              </div>
            )}

            {catalog.ok && matched.length > filters.limit ? (
              <NumberedPagination
                info={numberedPaginationTransformer(matched.length, filters.limit, page)}
                label={faceted('Pagination.label')}
                nextLabel={faceted('Pagination.next')}
                scroll={false}
              />
            ) : null}
          </div>
        </div>
      </div>

      <CategoryViewed
        category={category}
        categoryIds={categoryIds}
        products={visible.map((product) => product.node)}
        sensitiveProductIds={[...sensitiveProductIds]}
      />
    </section>
  );
}

function sizeLabel(size: OpeningSize, cutToFit: string) {
  return size.type === 'cut-to-fit' ? cutToFit : `${size.mm} mm`;
}

function FilterFields({ filters }: { filters: ShopFilters }) {
  return (
    <>
      {filters.kind ? <input name="kind" type="hidden" value={filters.kind} /> : null}
      {filters.system ? <input name="system" type="hidden" value={filters.system} /> : null}
      {filters.brands.map((brand) => (
        <input key={brand} name="brand" type="hidden" value={brand} />
      ))}
      {filters.sizes.map((size) => (
        <input key={size} name="size" type="hidden" value={size} />
      ))}
      {filters.sort !== 'featured' ? (
        <input name="sort" type="hidden" value={filters.sort} />
      ) : null}
      {filters.limit !== DEFAULT_FACETED_PAGE_SIZE ? (
        <input name="limit" type="hidden" value={filters.limit} />
      ) : null}
    </>
  );
}

function FilterRow({
  children,
  id,
  label,
}: {
  children: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="os-row">
      <span className="os-row-label" id={id}>
        {label}
      </span>
      <div aria-labelledby={id} className="os-chips" role="group">
        {children}
      </div>
    </div>
  );
}

function Chip({
  count,
  href,
  label,
  pressed,
}: {
  count: number;
  href: string;
  label: string;
  pressed: boolean;
}) {
  return (
    <Link
      aria-pressed={pressed}
      className={pressed ? 'os-chip is-active' : 'os-chip'}
      href={href}
      scroll={false}
    >
      <span>{label}</span>
      <span className="os-chip-count">{count}</span>
    </Link>
  );
}
