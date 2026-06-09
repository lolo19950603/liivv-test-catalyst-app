/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { clsx } from 'clsx';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useOptimistic, useState, useTransition } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { RangeInput } from '@/vibes/soul/form/range-input';
import { ToggleGroup } from '@/vibes/soul/form/toggle-group';
import './archive-filters.css';
import { FilterCheckboxList } from '@/vibes/soul/sections/products-list-section/filter-checkbox-list';
import { Stream, Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { Button } from '@/vibes/soul/primitives/button';
import { NumberedPaginationInfo } from '@/vibes/soul/primitives/numbered-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Link } from '~/components/link';

import { getFilterParsers } from './filter-parsers';

export interface LinkGroupFilter {
  type: 'link-group';
  label: string;
  links: Array<{ label: string; href: string }>;
}

export interface ToggleGroupFilter {
  type: 'toggle-group';
  paramName: string;
  label: string;
  defaultCollapsed?: boolean;
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
    productCount?: number;
  }>;
}

export interface RatingFilter {
  type: 'rating';
  paramName: string;
  label: string;
  disabled?: boolean;
  defaultCollapsed?: boolean;
}

export interface RangeFilter {
  type: 'range';
  label: string;
  defaultCollapsed?: boolean;
  minParamName: string;
  maxParamName: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  minPrepend?: React.ReactNode;
  maxPrepend?: React.ReactNode;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  disabled?: boolean;
}

export type Filter = ToggleGroupFilter | RangeFilter | RatingFilter | LinkGroupFilter;

type FilterAppearance = 'default' | 'archive';

interface Props {
  appearance?: FilterAppearance;
  className?: string;
  filters: Streamable<Filter[]>;
  resetFiltersLabel?: Streamable<string>;
  paginationInfo?: Streamable<NumberedPaginationInfo>;
  rangeFilterApplyLabel?: Streamable<string>;
}

type InnerProps = Omit<Props, 'filters'> & { filters: Filter[] };

function getParamCountLabel(params: Record<string, string | null | string[]>, key: string) {
  const value = params[key];

  if (Array.isArray(value) && value.length > 0) return `(${value.length})`;

  return '';
}

export function FiltersPanel({
  appearance = 'archive',
  className,
  filters: streamableFilters,
  paginationInfo,
  resetFiltersLabel,
  rangeFilterApplyLabel,
}: Props) {
  return (
    <Stream fallback={<FiltersSkeleton appearance={appearance} />} value={streamableFilters}>
      {(filters) => (
        <FiltersPanelInner
          appearance={appearance}
          className={className}
          filters={filters}
          paginationInfo={paginationInfo}
          rangeFilterApplyLabel={rangeFilterApplyLabel}
          resetFiltersLabel={resetFiltersLabel}
        />
      )}
    </Stream>
  );
}

function getInitialExpandedFilters(filters: Filter[], appearance: FilterAppearance) {
  const initial = new Set<string>();
  const accordionFilters = filters.filter((filter) => filter.type !== 'link-group');

  if (appearance === 'archive') {
    accordionFilters.forEach((filter) => {
      if (!filter.defaultCollapsed) {
        initial.add(filter.label.toLowerCase());
      }
    });

    return initial;
  }

  accordionFilters.slice(0, 3).forEach((filter) => {
    initial.add(filter.label.toLowerCase());
  });

  return initial;
}

export function FiltersPanelInner({
  appearance = 'archive',
  className,
  filters,
  resetFiltersLabel: streamableResetFiltersLabel,
  rangeFilterApplyLabel: streamableRangeFilterApplyLabel,
  paginationInfo: streamablePaginationInfo,
}: InnerProps) {
  const resetFiltersLabel = useStreamable(streamableResetFiltersLabel) ?? 'Reset filters';
  const rangeFilterApplyLabel = useStreamable(streamableRangeFilterApplyLabel);
  const paginationInfo = useStreamable(streamablePaginationInfo);
  const pageParamName = paginationInfo?.pageParamName ?? 'page';
  const [params, setParams] = useQueryStates(
    {
      ...getFilterParsers(filters),
      [pageParamName]: parseAsInteger,
      before: parseAsString,
      after: parseAsString,
    },
    {
      shallow: false,
      history: 'push',
    },
  );
  const [isPending, startTransition] = useTransition();
  const [optimisticParams, setOptimisticParams] = useOptimistic(params);
  const [expandedItems, setExpandedItems] = useState(() =>
    getInitialExpandedFilters(filters, appearance),
  );
  const isArchive = appearance === 'archive';
  const accordionVariant = isArchive ? 'archive' : 'default';

  const accordionItems = filters
    .filter((filter) => filter.type !== 'link-group')
    .map((filter) => {
      return {
        key: filter.label.toLowerCase(),
        value: filter.label.toLowerCase(),
        filter,
        expanded: expandedItems.has(filter.label.toLowerCase()),
      };
    });

  if (filters.length === 0) return null;

  const linkGroupFilters = filters.filter(
    (filter): filter is LinkGroupFilter => filter.type === 'link-group',
  );

  return (
    <div
      className={clsx(isArchive && 'liivv-archive-filters', !isArchive && 'space-y-5', className)}
      data-pending={isPending ? true : null}
    >
      {linkGroupFilters.map((linkGroup, index) => (
        <div key={index.toString()}>
          <h3 className="py-4 font-mono text-sm uppercase text-contrast-400">{linkGroup.label}</h3>
          <ul>
            {linkGroup.links.map((link, linkIndex) => (
              <li className="py-2" key={linkIndex.toString()}>
                <Link
                  className="font-body text-base font-medium text-contrast-500 transition-colors duration-300 ease-out hover:text-foreground"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Accordion
        onValueChange={(items) => {
          setExpandedItems(new Set(items));
        }}
        type="multiple"
        value={accordionItems.filter((item) => item.expanded).map((item) => item.value)}
      >
        {accordionItems.map((accordionItem) => {
          const { key, value, filter } = accordionItem;

          switch (filter.type) {
            case 'toggle-group':
              return (
                <AccordionItem
                  key={key}
                  title={
                    isArchive
                      ? filter.label
                      : `${filter.label}${getParamCountLabel(optimisticParams, filter.paramName)}`
                  }
                  value={value}
                  variant={accordionVariant}
                >
                  {isArchive ? (
                    <FilterCheckboxList
                      onValueChange={(toggleGroupValues) => {
                        startTransition(async () => {
                          const nextParams = {
                            ...optimisticParams,
                            [pageParamName]: null,
                            before: null,
                            after: null,
                            [filter.paramName]:
                              toggleGroupValues.length === 0 ? null : toggleGroupValues,
                          };

                          setOptimisticParams(nextParams);
                          await setParams(nextParams);
                        });
                      }}
                      options={filter.options}
                      value={optimisticParams[filter.paramName] ?? []}
                    />
                  ) : (
                    <ToggleGroup
                      onValueChange={(toggleGroupValues) => {
                        startTransition(async () => {
                          const nextParams = {
                            ...optimisticParams,
                            [pageParamName]: null,
                            before: null,
                            after: null,
                            [filter.paramName]:
                              toggleGroupValues.length === 0 ? null : toggleGroupValues,
                          };

                          setOptimisticParams(nextParams);
                          await setParams(nextParams);
                        });
                      }}
                      options={filter.options}
                      type="multiple"
                      value={optimisticParams[filter.paramName] ?? []}
                    />
                  )}
                </AccordionItem>
              );

            case 'range':
              return (
                <AccordionItem key={key} title={filter.label} value={value}>
                  <RangeInput
                    applyLabel={rangeFilterApplyLabel}
                    disabled={filter.disabled}
                    max={filter.max}
                    maxLabel={filter.maxLabel}
                    maxName={filter.maxParamName}
                    maxPlaceholder={filter.maxPlaceholder}
                    maxPrepend={filter.maxPrepend}
                    min={filter.min}
                    minLabel={filter.minLabel}
                    minName={filter.minParamName}
                    minPlaceholder={filter.minPlaceholder}
                    minPrepend={filter.minPrepend}
                    onChange={({ min, max }) => {
                      startTransition(async () => {
                        const nextParams = {
                          ...optimisticParams,
                          [filter.minParamName]: min,
                          [filter.maxParamName]: max,
                          [pageParamName]: null,
                          before: null,
                          after: null,
                        };

                        setOptimisticParams(nextParams);
                        await setParams(nextParams);
                      });
                    }}
                    value={{
                      min: optimisticParams[filter.minParamName] ?? null,
                      max: optimisticParams[filter.maxParamName] ?? null,
                    }}
                  />
                </AccordionItem>
              );

            case 'rating':
              return (
                <AccordionItem key={key} title={filter.label} value={value} variant={accordionVariant}>
                  <div className={clsx(isArchive ? 'space-y-1.5' : 'space-y-3')}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Checkbox
                        checked={
                          optimisticParams[filter.paramName]?.includes(rating.toString()) ?? false
                        }
                        disabled={filter.disabled}
                        key={rating}
                        label={<Rating rating={rating} showRating={false} />}
                        onCheckedChange={(checked) =>
                          startTransition(async () => {
                            const ratings = new Set(optimisticParams[filter.paramName]);

                            if (checked === true) ratings.add(rating.toString());
                            else ratings.delete(rating.toString());

                            const nextParams = {
                              ...optimisticParams,
                              [filter.paramName]: Array.from(ratings),
                              [pageParamName]: null,
                              before: null,
                              after: null,
                            };

                            setOptimisticParams(nextParams);
                            await setParams(nextParams);
                          })
                        }
                      />
                    ))}
                  </div>
                </AccordionItem>
              );

            default:
              return null;
          }
        })}
      </Accordion>

      <Button
        className={clsx(isArchive && 'mt-4 w-full')}
        onClick={() => {
          startTransition(async () => {
            const nextParams = {
              ...Object.fromEntries(Object.entries(optimisticParams).map(([key]) => [key, null])),
              [pageParamName]: null,
              before: null,
              after: null,
            };

            setOptimisticParams(nextParams);
            await setParams(nextParams);
          });
        }}
        size="small"
        variant="secondary"
      >
        {resetFiltersLabel}
      </Button>
    </div>
  );
}

export function FiltersSkeleton({ appearance = 'archive' }: { appearance?: FilterAppearance }) {
  const isArchive = appearance === 'archive';

  return (
    <div className={clsx(isArchive && 'liivv-archive-filters', !isArchive && 'space-y-5')}>
      <AccordionSkeleton variant={appearance}>
        {isArchive ? <CheckboxListSkeleton options={6} /> : <ToggleGroupSkeleton options={4} seed={2} />}
      </AccordionSkeleton>
      {!isArchive && (
        <>
          <AccordionSkeleton>
            <ToggleGroupSkeleton options={3} seed={1} />
          </AccordionSkeleton>
          <AccordionSkeleton>
            <RangeSkeleton />
          </AccordionSkeleton>
        </>
      )}
      <div
        className={clsx(
          'animate-pulse rounded-full bg-contrast-100',
          isArchive ? 'mt-4 h-10 w-full' : 'h-10 w-[10ch]',
        )}
      />
    </div>
  );
}

function AccordionSkeleton({
  children,
  variant = 'archive',
}: {
  children: React.ReactNode;
  variant?: FilterAppearance;
}) {
  const isArchive = variant === 'archive';

  return (
    <div>
      <div
        className={clsx(
          'flex items-center justify-between py-3',
          !isArchive && 'items-start font-mono text-sm uppercase @md:py-4',
        )}
      >
        <div className="inline-flex h-[1lh] items-center">
          <div
            className={clsx(
              'animate-pulse rounded-sm bg-contrast-100',
              isArchive ? 'h-4 w-[8ch]' : 'h-2 w-[10ch] flex-1',
            )}
          />
        </div>
      </div>
      <div className={isArchive ? 'pb-1' : 'pb-5'}>{children}</div>
    </div>
  );
}

function CheckboxListSkeleton({ options }: { options: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: options }, (_, i) => (
        <div className="flex items-center gap-3" key={i}>
          <div className="h-[18px] w-[18px] shrink-0 animate-pulse rounded-sm bg-contrast-100" />
          <div
            className="h-3.5 animate-pulse rounded-sm bg-contrast-100"
            style={{ width: `${String(14 + ((i * 5) % 12))}ch` }}
          />
        </div>
      ))}
    </div>
  );
}

function ToggleGroupSkeleton({ options, seed = 0 }: { options: number; seed?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: options }, (_, i) => {
        const width = Math.floor(((i * 3 + 7 + seed) % 8) + 6);

        return (
          <div
            className="h-12 w-[var(--width)] animate-pulse rounded-full bg-contrast-100 px-4"
            key={i}
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            style={{ '--width': `${width}ch` } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

function RangeSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-12 w-[10ch] animate-pulse rounded-lg bg-contrast-100" />
      <div className="h-12 w-[10ch] animate-pulse rounded-lg bg-contrast-100" />
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-contrast-100" />
    </div>
  );
}
