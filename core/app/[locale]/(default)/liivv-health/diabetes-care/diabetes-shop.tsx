/* Twin of ostomy-care/ostomy-shop.tsx @f7f9ef0b — port fixes both ways until Phase 2 */

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

import { showsFrDraftMarker } from './chapters/review-gates';
import { type DiabetesShopProduct, getDiabetesShopCatalog } from './get-diabetes-shop';
import { SHOP_DIABETES_HREF } from './landing-meta';
import {
  countShelf,
  matchesShelf,
  NEEDLE_TYPES,
  orderedBrands,
  type ShelfSelection,
  SHOP_TYPES,
  WORKS_WITH,
} from './shop-classify';
import {
  diabetesFiltersAreActive,
  type DiabetesShopFilters,
  diabetesShopHref,
  parseDiabetesShopFilters,
  toggleValue,
} from './shop-filters';

import './diabetes-shop.css';

/*
 * =============================================================================
 * THE DIABETES ESSENTIALS SHOP (Shop Diabetes Care, category 1151)
 * =============================================================================
 * Ostomy Essentials' shelf for the Diabetes category (owner note 9,
 * 2026-10-07): the filters beside the products, every filter a URL parameter
 * (./shop-filters.ts), exact counts, a pager. The category route renders it
 * for category 1151 (category/[slug]/page.tsx), in place of the store's
 * stock grid, whose brand filter could only list the few products that carry
 * a BigCommerce brand.
 *
 * Filters: what you need (type), brand, works with (device family), needle
 * length and gauge (pen needles and syringes only), and in stock. A type's
 * chip shows only when it has products; so does a brand's and a device's.
 *
 * Insulin (English only; the French shelf never lists it, nor counts it) and
 * glucagon are links to their product page ("View product"), never a
 * one-click add, so the pharmacist notice under the buy box is always seen.
 * =============================================================================
 */

type Category = NonNullable<Awaited<ReturnType<typeof getCategoryPageData>>['category']>;

export function DiabetesShopFallback() {
  return (
    <div aria-hidden className="ds-fallback">
      <div className="ds-wrap">
        <div className="ds-fallback-title" />
        <div className="ds-fallback-layout">
          <div className="ds-fallback-side" />
          <div className="ds-fallback-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="ds-fallback-card" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function DiabetesShop({
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
  const [locale, params, t, commerce, chapterT, faceted] = await Promise.all([
    getLocale(),
    searchParams,
    getTranslations('DiabetesCare.ui.shopPage'),
    getTranslations('DiabetesCare.ui.commerce'),
    getTranslations('DiabetesCare.ui.chapter'),
    getTranslations('Faceted'),
  ]);
  const filters = parseDiabetesShopFilters(params);
  const path = category.path || SHOP_DIABETES_HREF;
  const catalog = await getDiabetesShopCatalog(
    locale,
    filters.sort,
    outOfStockMessage,
    showBackorderMessage,
  );
  const products = catalog.products;
  const selection: ShelfSelection = {
    ...(filters.type ? { type: filters.type } : {}),
    brands: filters.brands,
    works: filters.works,
    lengths: filters.lengths,
    gauges: filters.gauges,
    inStock: filters.inStock,
    ...(filters.term ? { term: filters.term } : {}),
  };
  const matched = products.filter((product) => matchesShelf(product, selection));
  const pageCount = Math.max(1, Math.ceil(matched.length / filters.limit));
  const page = Math.min(filters.page, pageCount);
  const visible = matched.slice((page - 1) * filters.limit, page * filters.limit);
  const viewProduct = commerce('viewProduct');
  const cards = visible.map((product) =>
    product.viewOnly ? { ...product.card, viewOnlyLabel: viewProduct } : product.card,
  );

  const active = diabetesFiltersAreActive(filters);
  const clearHref = diabetesShopHref(path, filters, {
    type: undefined,
    brands: [],
    works: [],
    lengths: [],
    gauges: [],
    inStock: false,
    term: undefined,
    page: 1,
  });
  const sensitiveProductIds = await getSensitiveProductIds(
    visible.map((product) => product.entityId),
  );

  return (
    <section aria-label={t('label')} id="diabetes-shop">
      <div className="ds-wrap ds-intro">
        {breadcrumbs.length > 1 ? <Breadcrumbs breadcrumbs={breadcrumbs} /> : null}
        <header className="ds-head">
          {showsFrDraftMarker('shop', locale) ? (
            <p className="ds-fr-draft">{chapterT('frDraft')}</p>
          ) : null}
          <p className="ds-eyebrow">{t('eyebrow')}</p>
          <h1>{category.name}</h1>
          <p className="ds-lead">{t('description')}</p>
        </header>
      </div>

      <div className="ds-wrap ds-layout">
        <FilterRail filters={filters} path={path} products={products} selection={selection} />

        <div className="ds-main">
          <form action="" className="ds-search" method="get" role="search">
            <label className="ds-search-label" htmlFor="diabetes-shop-search">
              {t('searchLabel')}
            </label>
            <input
              defaultValue={filters.term ?? ''}
              id="diabetes-shop-search"
              name="term"
              placeholder={t('searchPlaceholder')}
              type="search"
            />
            <FilterFields filters={filters} />
            <button type="submit">{t('searchSubmit')}</button>
          </form>

          <div className="ds-meta">
            <p aria-live="polite" className="ds-count">
              {t('results', { count: matched.length })}
            </p>
            {active ? (
              <Link className="ds-clear" href={clearHref} scroll={false}>
                {t('clear')}
              </Link>
            ) : null}
            <div className="liivv-catalog-toolbar ds-toolbar">
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

          {filters.type === 'insulin' && locale !== 'fr' ? (
            <div className="ds-notice">
              <p>{commerce('pharmacistNotice')}</p>
              <p>{commerce('insulinColdChain')}</p>
              <p>{commerce('quebecInsulin')}</p>
            </div>
          ) : null}

          <div className="ds-results" id="diabetes-shop-results">
            {catalog.ok && visible.length > 0 ? (
              <ProductList
                cardVariant="archive"
                className="ds-grid"
                fallbackLogo={fallbackLogo}
                products={cards}
                quickActions={quickActions}
                showCompare={false}
              />
            ) : (
              <div className="ds-empty">
                <p>{catalog.ok ? t('empty') : t('unavailable')}</p>
                {catalog.ok && active ? (
                  <Link className="ds-clear" href={clearHref}>
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

/* The filters beside the products. Every chip is a link that keeps the other filters. */
async function FilterRail({
  filters,
  path,
  products,
  selection,
}: {
  filters: DiabetesShopFilters;
  path: string;
  products: readonly DiabetesShopProduct[];
  selection: ShelfSelection;
}) {
  const t = await getTranslations('DiabetesCare.ui.shopPage');
  const types = SHOP_TYPES.filter((type) => products.some((product) => product.type === type));
  const brands = orderedBrands(products.map((product) => product.brand));
  const devices = WORKS_WITH.filter(({ id }) =>
    products.some((product) => product.works.includes(id)),
  );
  const needleRows = filters.type != null && NEEDLE_TYPES.includes(filters.type);
  const ofType = needleRows ? products.filter((product) => product.type === filters.type) : [];
  const lengths = [...new Set(ofType.flatMap((product) => product.needle.lengths))].sort(
    (a, b) => Number(a) - Number(b),
  );
  const gauges = [...new Set(ofType.flatMap((product) => product.needle.gauges))].sort(
    (a, b) => Number(a) - Number(b),
  );

  const withoutType: ShelfSelection = { ...selection, type: undefined, lengths: [], gauges: [] };

  const isSelectedBrand = (slug: string, label: string) =>
    filters.brands.some(
      (selected) =>
        selected.toLowerCase() === slug || selected.toLowerCase() === label.toLowerCase(),
    );

  return (
    <aside aria-label={t('filtersLabel')} className="ds-side">
      <div className="ds-filters">
        <FilterRow id="ds-type" label={t('typeLabel')}>
          <Chip
            count={countShelf(products, withoutType)}
            href={diabetesShopHref(path, filters, {
              type: undefined,
              lengths: [],
              gauges: [],
              page: 1,
            })}
            label={t('all')}
            pressed={filters.type == null}
          />
          {types.map((type) => (
            <Chip
              count={countShelf(products, { ...withoutType, type })}
              href={diabetesShopHref(path, filters, { type, lengths: [], gauges: [], page: 1 })}
              key={type}
              label={t(`types.${type}`)}
              pressed={filters.type === type}
            />
          ))}
        </FilterRow>

        {needleRows && lengths.length > 0 ? (
          <FilterRow id="ds-length" label={t('lengthLabel')}>
            <Chip
              count={countShelf(products, { ...selection, lengths: [] })}
              href={diabetesShopHref(path, filters, { lengths: [], page: 1 })}
              label={t('anyLength')}
              pressed={filters.lengths.length === 0}
            />
            {lengths.map((length) => (
              <Chip
                count={countShelf(products, { ...selection, lengths: [length] })}
                href={diabetesShopHref(path, filters, {
                  lengths: toggleValue(filters.lengths, length),
                  page: 1,
                })}
                key={length}
                label={t('millimetres', { mm: length })}
                pressed={filters.lengths.includes(length)}
              />
            ))}
          </FilterRow>
        ) : null}

        {needleRows && gauges.length > 0 ? (
          <FilterRow id="ds-gauge" label={t('gaugeLabel')}>
            <Chip
              count={countShelf(products, { ...selection, gauges: [] })}
              href={diabetesShopHref(path, filters, { gauges: [], page: 1 })}
              label={t('anyGauge')}
              pressed={filters.gauges.length === 0}
            />
            {gauges.map((gauge) => (
              <Chip
                count={countShelf(products, { ...selection, gauges: [gauge] })}
                href={diabetesShopHref(path, filters, {
                  gauges: toggleValue(filters.gauges, gauge),
                  page: 1,
                })}
                key={gauge}
                label={t('gaugeValue', { gauge })}
                pressed={filters.gauges.includes(gauge)}
              />
            ))}
          </FilterRow>
        ) : null}

        {brands.length > 0 ? (
          <FilterRow id="ds-brand" label={t('brandLabel')}>
            <Chip
              count={countShelf(products, { ...selection, brands: [] })}
              href={diabetesShopHref(path, filters, { brands: [], page: 1 })}
              label={t('allBrands')}
              pressed={filters.brands.length === 0}
            />
            {brands.map((brand) => (
              <Chip
                count={countShelf(products, { ...selection, brands: [brand.slug] })}
                href={diabetesShopHref(path, filters, {
                  brands: isSelectedBrand(brand.slug, brand.label)
                    ? filters.brands.filter(
                        (selected) =>
                          selected.toLowerCase() !== brand.slug &&
                          selected.toLowerCase() !== brand.label.toLowerCase(),
                      )
                    : [...filters.brands, brand.slug],
                  page: 1,
                })}
                key={brand.slug}
                label={brand.label}
                pressed={isSelectedBrand(brand.slug, brand.label)}
              />
            ))}
          </FilterRow>
        ) : null}

        {devices.length > 0 ? (
          <details className="ds-more" open={filters.works.length > 0 || undefined}>
            <summary>
              <span className="ds-row-label">{t('worksLabel')}</span>
              {filters.works.length > 0 ? (
                <span className="ds-chip-count">{filters.works.length}</span>
              ) : null}
            </summary>
            <FilterRow id="ds-works" label={t('worksLabel')} visuallyHiddenLabel>
              <Chip
                count={countShelf(products, { ...selection, works: [] })}
                href={diabetesShopHref(path, filters, { works: [], page: 1 })}
                label={t('anyDevice')}
                pressed={filters.works.length === 0}
              />
              {devices.map((device) => (
                <Chip
                  count={countShelf(products, { ...selection, works: [device.id] })}
                  href={diabetesShopHref(path, filters, {
                    works: toggleValue(filters.works, device.id),
                    page: 1,
                  })}
                  key={device.id}
                  label={device.label}
                  pressed={filters.works.includes(device.id)}
                />
              ))}
            </FilterRow>
          </details>
        ) : null}

        <FilterRow id="ds-stock" label={t('stockLabel')}>
          <Chip
            count={countShelf(products, { ...selection, inStock: true })}
            href={diabetesShopHref(path, filters, { inStock: !filters.inStock, page: 1 })}
            label={t('inStock')}
            pressed={filters.inStock}
          />
        </FilterRow>
      </div>
    </aside>
  );
}

function FilterFields({ filters }: { filters: DiabetesShopFilters }) {
  return (
    <>
      {filters.type ? <input name="type" type="hidden" value={filters.type} /> : null}
      {filters.brands.map((brand) => (
        <input key={`brand-${brand}`} name="brand" type="hidden" value={brand} />
      ))}
      {filters.works.map((id) => (
        <input key={`works-${id}`} name="works" type="hidden" value={id} />
      ))}
      {filters.lengths.map((length) => (
        <input key={`length-${length}`} name="length" type="hidden" value={length} />
      ))}
      {filters.gauges.map((gauge) => (
        <input key={`gauge-${gauge}`} name="gauge" type="hidden" value={gauge} />
      ))}
      {filters.inStock ? <input name="stock" type="hidden" value="1" /> : null}
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
  visuallyHiddenLabel = false,
}: {
  children: ReactNode;
  id: string;
  label: string;
  visuallyHiddenLabel?: boolean;
}) {
  return (
    <div className="ds-row">
      <span className={visuallyHiddenLabel ? 'ds-sr-only' : 'ds-row-label'} id={id}>
        {label}
      </span>
      <div aria-labelledby={id} className="ds-chips" role="group">
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
      className={pressed ? 'ds-chip is-active' : 'ds-chip'}
      href={href}
      scroll={false}
    >
      <span>{label}</span>
      <span className="ds-chip-count">{count}</span>
    </Link>
  );
}
