import { Sliders } from 'lucide-react';
import { type ReactNode, Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import {
  NumberedPagination,
  NumberedPaginationInfo,
} from '@/vibes/soul/primitives/numbered-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { type ProductImageFallbackLogo } from '@/vibes/soul/primitives/product-card';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { Filter, FiltersPanel } from '@/vibes/soul/sections/products-list-section/filters-panel';
import './catalog-toolbar.css';
import { DEFAULT_FACETED_PAGE_SIZE } from '@/vibes/soul/sections/products-list-section/constants';
import { PageSize, PageSizeSkeleton } from '@/vibes/soul/sections/products-list-section/page-size';
import {
  Sorting,
  SortingSkeleton,
  Option as SortOption,
} from '@/vibes/soul/sections/products-list-section/sorting';

interface Props {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  title?: Streamable<string | null>;
  totalCount: Streamable<string>;
  products: Streamable<Product[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<Product[]>;
  paginationInfo?: Streamable<NumberedPaginationInfo>;
  paginationLabel?: Streamable<string | null>;
  paginationNextLabel?: Streamable<string | null>;
  compareHref?: string;
  compareLabel?: Streamable<string>;
  showCompare?: Streamable<boolean>;
  filterLabel?: string;
  filtersPanelTitle?: Streamable<string>;
  resetFiltersLabel?: Streamable<string>;
  showRating?: boolean;
  rangeFilterApplyLabel?: Streamable<string>;
  sortLabel?: Streamable<string | null>;
  sortPlaceholder?: Streamable<string | null>;
  sortParamName?: string;
  sortDefaultValue?: string;
  pageSizeLabel?: Streamable<string | null>;
  pageSizeOptions?: Streamable<SortOption[]>;
  pageSizeDefaultValue?: number;
  pageSizeParamName?: string;
  compareParamName?: string;
  emptyStateSubtitle?: Streamable<string>;
  emptyStateTitle?: Streamable<string>;
  placeholderCount?: number;
  removeLabel?: Streamable<string>;
  maxItems?: number;
  maxCompareLimitMessage?: Streamable<string>;
  cardVariant?: 'default' | 'archive';
  paginationVariant?: 'default' | 'archive';
  searchPanel?: ReactNode;
  fallbackLogo?: ProductImageFallbackLogo | null;
}

export function ProductsListSection({
  breadcrumbs: streamableBreadcrumbs,
  title = 'Products',
  totalCount,
  products,
  showRating,
  compareProducts,
  sortOptions: streamableSortOptions,
  sortDefaultValue,
  filters,
  compareHref,
  compareLabel,
  showCompare,
  paginationInfo,
  paginationLabel,
  paginationNextLabel,
  filterLabel = 'Filters',
  filtersPanelTitle: streamableFiltersPanelTitle = 'Filters',
  resetFiltersLabel,
  rangeFilterApplyLabel,
  sortLabel: streamableSortLabel,
  sortPlaceholder: streamableSortPlaceholder,
  sortParamName,
  pageSizeLabel: streamablePageSizeLabel,
  pageSizeOptions: streamablePageSizeOptions,
  pageSizeDefaultValue = DEFAULT_FACETED_PAGE_SIZE,
  pageSizeParamName = 'limit',
  compareParamName,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount = 8,
  removeLabel,
  maxItems,
  maxCompareLimitMessage,
  cardVariant = 'archive',
  paginationVariant = 'archive',
  searchPanel,
  fallbackLogo,
}: Props) {
  return (
    <div className="group/products-list-section @container">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <div>
          <Stream fallback={<BreadcrumbsSkeleton />} value={streamableBreadcrumbs}>
            {(breadcrumbs) =>
              breadcrumbs && breadcrumbs.length > 1 && <Breadcrumbs breadcrumbs={breadcrumbs} />
            }
          </Stream>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-6 text-foreground">
            <h1 className="flex items-center gap-2 font-heading text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
              <Suspense
                fallback={
                  <span className="inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg bg-contrast-100" />
                }
              >
                {title}
              </Suspense>
              <Suspense
                fallback={
                  <span className="inline-flex h-[1lh] w-[2ch] animate-pulse rounded-lg bg-contrast-100" />
                }
              >
                <span className="text-contrast-300">{totalCount}</span>
              </Suspense>
            </h1>
            <div className="liivv-catalog-toolbar">
              <div className="liivv-catalog-toolbar__controls">
                {streamablePageSizeOptions && (
                  <Stream
                    fallback={<PageSizeSkeleton />}
                    value={Streamable.all([streamablePageSizeLabel, streamablePageSizeOptions])}
                  >
                    {([label, options]) => (
                      <PageSize
                        defaultValue={pageSizeDefaultValue}
                        label={label}
                        options={options}
                        paramName={pageSizeParamName}
                      />
                    )}
                  </Stream>
                )}
                <Stream
                  fallback={<SortingSkeleton />}
                  value={Streamable.all([
                    streamableSortLabel,
                    streamableSortOptions,
                    streamableSortPlaceholder,
                  ])}
                >
                  {([label, options, placeholder]) => (
                    <Sorting
                      defaultValue={sortDefaultValue}
                      label={label}
                      options={options}
                      paramName={sortParamName}
                      placeholder={placeholder}
                    />
                  )}
                </Stream>
              </div>
              <div className="block @3xl:hidden">
                <SidePanel.Root>
                  <SidePanel.Trigger asChild>
                    <Button size="medium" variant="secondary">
                      {filterLabel}
                      <span className="hidden @xl:block">
                        <Sliders size={20} />
                      </span>
                    </Button>
                  </SidePanel.Trigger>
                  <Stream value={streamableFiltersPanelTitle}>
                    {(filtersPanelTitle) => (
                      <SidePanel.Content title={filtersPanelTitle}>
                        <FiltersPanel
                          appearance={cardVariant === 'archive' ? 'archive' : 'default'}
                          filters={filters}
                          paginationInfo={paginationInfo}
                          rangeFilterApplyLabel={rangeFilterApplyLabel}
                          resetFiltersLabel={resetFiltersLabel}
                        />
                      </SidePanel.Content>
                    )}
                  </Stream>
                </SidePanel.Root>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-stretch gap-8 @4xl:gap-10">
          <aside className="hidden w-60 shrink-0 @3xl:block @4xl:w-72">
            <Stream value={streamableFiltersPanelTitle}>
              {(filtersPanelTitle) => <h2 className="sr-only">{filtersPanelTitle}</h2>}
            </Stream>
            <FiltersPanel
              appearance={cardVariant === 'archive' ? 'archive' : 'default'}
              className="sticky top-4"
              filters={filters}
              paginationInfo={paginationInfo}
              rangeFilterApplyLabel={rangeFilterApplyLabel}
              resetFiltersLabel={resetFiltersLabel}
            />
          </aside>

          <div className="group-has-data-pending/products-list-section:animate-pulse flex-1">
            {searchPanel}
            <ProductList
              cardVariant={cardVariant}
              compareHref={compareHref}
              fallbackLogo={fallbackLogo}
              compareLabel={compareLabel}
              compareParamName={compareParamName}
              compareProducts={compareProducts}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              maxCompareLimitMessage={maxCompareLimitMessage}
              maxItems={maxItems}
              placeholderCount={placeholderCount}
              products={products}
              removeLabel={removeLabel}
              showCompare={showCompare}
              showRating={showRating}
            />

            {paginationInfo && (
              <NumberedPagination
                info={paginationInfo}
                label={paginationLabel}
                nextLabel={paginationNextLabel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
