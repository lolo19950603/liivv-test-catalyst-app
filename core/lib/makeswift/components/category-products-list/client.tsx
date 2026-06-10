'use client';

import { clsx } from 'clsx';
import { useMemo, useState } from 'react';

import { ProductList, ProductListSkeleton } from '@/vibes/soul/sections/product-list';

import { comboboxEntityIdFromMakeswift } from '~/lib/makeswift/utils/combobox-entity-id';
import { useCategoryProducts } from '~/lib/makeswift/utils/use-category-products';

export type CategoryProductsListCategory = {
  entityId?: unknown;
  tabLabel?: string;
};

type CategoryProductsSort =
  | 'FEATURED'
  | 'NEWEST'
  | 'BEST_SELLING'
  | 'A_TO_Z'
  | 'Z_TO_A'
  | 'LOWEST_PRICE'
  | 'HIGHEST_PRICE'
  | 'BEST_REVIEWED'
  | 'RELEVANCE';

export type CategoryProductsListProps = {
  className?: string;
  categories?: CategoryProductsListCategory[];
  heading?: {
    text?: string;
    show?: boolean;
    showCount?: boolean;
  };
  catalog?: {
    displayMode?: 'combined' | 'tabs';
    limit?: number;
    sort?: CategoryProductsSort;
    searchSubCategories?: boolean;
  };
  display?: {
    aspectRatio?: '1:1' | '5:6' | '3:4';
    colorScheme?: 'light' | 'dark';
  };
  emptyState?: {
    title?: string;
    subtitle?: string;
  };
};

function resolveCategorySelections(categories?: CategoryProductsListCategory[]) {
  return (categories ?? [])
    .map((category) => ({
      entityId: comboboxEntityIdFromMakeswift(category.entityId),
      tabLabel: category.tabLabel?.trim() ?? '',
    }))
    .filter((category) => category.entityId.length > 0);
}

export function CategoryProductsList({
  className,
  categories,
  heading,
  catalog,
  display,
  emptyState,
}: CategoryProductsListProps) {
  const showTitle = heading?.show ?? true;
  const showProductCount = heading?.showCount ?? true;
  const titleOverride = heading?.text?.trim() ?? '';
  const displayMode = catalog?.displayMode ?? 'combined';
  const limit = catalog?.limit ?? 12;
  const sort = catalog?.sort ?? 'FEATURED';
  const searchSubCategories = catalog?.searchSubCategories ?? true;
  const aspectRatio = display?.aspectRatio ?? '5:6';
  const colorScheme = display?.colorScheme ?? 'light';
  const emptyStateTitle = emptyState?.title?.trim() || 'No products found';
  const emptyStateSubtitle =
    emptyState?.subtitle?.trim() || 'Try selecting a different category.';

  const selections = useMemo(() => resolveCategorySelections(categories), [categories]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const activeSelection =
    displayMode === 'tabs' && selections.length > 0
      ? selections[Math.min(activeTabIndex, selections.length - 1)]
      : null;

  const categoryEntityIds =
    displayMode === 'tabs' && activeSelection != null
      ? [activeSelection.entityId]
      : selections.map((selection) => selection.entityId);

  const { products, totalItems, isLoading, error } = useCategoryProducts({
    categoryEntityIds,
    limit,
    sort,
    searchSubCategories,
  });

  const headingText =
    titleOverride.length > 0
      ? titleOverride
      : displayMode === 'tabs' && activeSelection != null
        ? activeSelection.tabLabel || `Category ${activeSelection.entityId}`
        : selections.length === 1
          ? selections[0]?.tabLabel || `Category ${selections[0]?.entityId}`
          : 'Products';

  if (selections.length === 0) {
    return (
      <section className={clsx('category-products-list', className)}>
        <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @4xl:px-8">
          <p className="text-sm text-[var(--color-foreground)]/70">
            Select one or more categories in the Makeswift sidebar to show products here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={clsx('category-products-list', className)}>
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        {showTitle ? (
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-2">
            <h2 className="font-heading text-3xl font-medium leading-none text-foreground @lg:text-4xl">
              {headingText}
              {showProductCount ? (
                <span className="ml-2 text-2xl font-normal text-[var(--color-foreground)]/60 @lg:text-3xl">
                  {totalItems}
                </span>
              ) : null}
            </h2>
          </div>
        ) : null}

        {displayMode === 'tabs' && selections.length > 1 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {selections.map((selection, index) => {
              const isActive = index === activeTabIndex;
              const label = selection.tabLabel || `Category ${selection.entityId}`;

              return (
                <button
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-[rgb(var(--color-foreground))] bg-[rgb(var(--color-foreground))] text-[rgb(var(--color-background))]'
                      : 'border-[rgb(var(--color-foreground)/0.2)] bg-transparent text-[rgb(var(--color-foreground))] hover:border-[rgb(var(--color-foreground)/0.4)]',
                  )}
                  key={`${selection.entityId}-${index}`}
                  onClick={() => setActiveTabIndex(index)}
                  type="button"
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}

        {error != null ? (
          <p className="text-sm text-red-800">Could not load products for the selected categories.</p>
        ) : isLoading || products == null ? (
          <ProductListSkeleton className="group-has-data-pending/product-list:animate-pulse" />
        ) : (
          <ProductList
            aspectRatio={aspectRatio}
            cardVariant="archive"
            colorScheme={colorScheme}
            emptyStateSubtitle={emptyStateSubtitle}
            emptyStateTitle={emptyStateTitle}
            products={products}
            showCompare={false}
          />
        )}
      </div>
    </section>
  );
}
