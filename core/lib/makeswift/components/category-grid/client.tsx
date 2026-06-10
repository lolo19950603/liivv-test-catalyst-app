'use client';

import { clsx } from 'clsx';
import { useMemo, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { comboboxEntityIdFromMakeswift } from '~/lib/makeswift/utils/combobox-entity-id';
import { useCategoriesByIds } from '~/lib/makeswift/utils/use-categories-by-ids';
import { useStoreLogoFallback } from '~/lib/makeswift/utils/use-store-logo-fallback';

export type CategoryGridItem = {
  entityId?: unknown;
  label?: string;
};

export type CategoryGridProps = {
  className?: string;
  categories?: CategoryGridItem[];
  columns?: '2' | '3' | '4';
  aspectRatio?: '1:1' | '4:5' | '3:4';
};

const columnClassName = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
} as const;

function normalizeColumns(columns?: unknown): keyof typeof columnClassName {
  const value = String(columns ?? '4');

  if (value === '2' || value === '3' || value === '4') {
    return value;
  }

  return '4';
}

const aspectRatioClassName = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '3:4': 'aspect-[3/4]',
} as const;

function resolveCategorySelections(categories?: CategoryGridItem[]) {
  return (categories ?? [])
    .map((category) => ({
      entityId: comboboxEntityIdFromMakeswift(category.entityId),
      label: category.label?.trim() ?? '',
    }))
    .filter((category) => category.entityId.length > 0);
}

function CategoryGridCard({
  aspectRatio,
  fallbackLogo,
  href,
  image,
  title,
}: {
  aspectRatio: NonNullable<CategoryGridProps['aspectRatio']>;
  fallbackLogo: ReturnType<typeof useStoreLogoFallback>['fallbackLogo'];
  href: string;
  image: { src: string; alt: string } | null;
  title: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = image?.src.trim() ?? '';
  const hasCategoryImage = imageSrc.length > 0 && !imageFailed;
  const hasLogoImage = fallbackLogo?.src != null && fallbackLogo.src.length > 0;
  const hasLogoText = fallbackLogo?.text != null && fallbackLogo.text.length > 0;

  return (
    <article className="flex flex-col gap-3">
      <Link
        className={clsx(
          'relative block w-full overflow-hidden rounded-2xl bg-[hsl(var(--contrast-100))]',
          aspectRatioClassName[aspectRatio],
        )}
        href={href}
      >
        {hasCategoryImage ? (
          <Image
            alt={image?.alt ?? title}
            className="object-cover object-center"
            fill
            onError={() => {
              setImageFailed(true);
            }}
            sizes="(max-width: 768px) 50vw, 25vw"
            src={imageSrc}
          />
        ) : hasLogoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={fallbackLogo?.alt ?? title}
            className="absolute inset-0 size-full object-contain object-center p-8"
            src={fallbackLogo.src}
          />
        ) : hasLogoText ? (
          <span className="absolute inset-0 flex items-center justify-center p-6 text-center text-lg font-semibold text-[hsl(var(--foreground))]">
            {fallbackLogo.text}
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
            {title}
          </span>
        )}
      </Link>
      <p className="text-center text-base font-medium leading-snug text-[hsl(var(--foreground))]">
        {title}
      </p>
    </article>
  );
}

export function CategoryGrid({
  className,
  categories,
  columns: columnsProp = '4',
  aspectRatio = '1:1',
}: CategoryGridProps) {
  const columns = normalizeColumns(columnsProp);
  const selections = useMemo(() => resolveCategorySelections(categories), [categories]);
  const entityIds = useMemo(() => selections.map((category) => category.entityId), [selections]);
  const { categories: storeCategories, isLoading } = useCategoriesByIds(entityIds);
  const { fallbackLogo } = useStoreLogoFallback();
  const categoriesById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof storeCategories>[number]>();

    for (const category of storeCategories ?? []) {
      map.set(String(category.entityId), category);
    }

    return map;
  }, [storeCategories]);

  if (selections.length === 0) {
    return null;
  }

  if (isLoading && storeCategories == null) {
    return (
      <div className={clsx('w-full', className)}>
        <div className={clsx('grid gap-6', columnClassName[columns])}>
          {selections.map((selection, index) => (
            <div className="flex flex-col gap-3" key={`${selection.entityId}-${index}`}>
              <div
                className={clsx(
                  'animate-pulse rounded-2xl bg-[hsl(var(--contrast-100))]',
                  aspectRatioClassName[aspectRatio],
                )}
              />
              <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-[hsl(var(--contrast-100))]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && categoriesById.size === 0) {
    return null;
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('grid gap-6 md:gap-8', columnClassName[columns])}>
        {selections.map((selection, index) => {
          const category = categoriesById.get(selection.entityId);

          if (category == null) {
            return null;
          }

          const override = selection.label;
          const title = override.length > 0 ? override : category.name;

          return (
            <CategoryGridCard
              aspectRatio={aspectRatio}
              fallbackLogo={fallbackLogo}
              href={category.path}
              image={category.image}
              key={`${selection.entityId}-${index}`}
              title={title}
            />
          );
        })}
      </div>
    </div>
  );
}
