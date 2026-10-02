import type { SearchParams } from 'nuqs/server';

import {
  DEFAULT_FACETED_PAGE_SIZE,
  FACETED_PAGE_SIZES,
} from '@/vibes/soul/sections/products-list-section/constants';

import { CUT_TO_FIT, type PouchSystem, type ShopKind } from './shop-classify';

export const SHOP_SORTS = [
  'featured',
  'newest',
  'best_selling',
  'a_to_z',
  'z_to_a',
  'best_reviewed',
  'lowest_price',
  'highest_price',
  'relevance',
] as const;

export type ShopSort = (typeof SHOP_SORTS)[number];

const SHOP_SORT_QUERY = {
  featured: 'FEATURED',
  newest: 'NEWEST',
  best_selling: 'BEST_SELLING',
  a_to_z: 'A_TO_Z',
  z_to_a: 'Z_TO_A',
  best_reviewed: 'BEST_REVIEWED',
  lowest_price: 'LOWEST_PRICE',
  highest_price: 'HIGHEST_PRICE',
  relevance: 'RELEVANCE',
} as const;

export type ShopSortQuery = (typeof SHOP_SORT_QUERY)[ShopSort];

const KIND_VALUES = ['pouches', 'barriers', 'accessories', 'kits'] as const;

export interface ShopFilters {
  kind?: ShopKind;
  system?: PouchSystem;
  brands: string[];
  sizes: string[];
  term?: string;
  sort: ShopSort;
  limit: number;
  page: number;
}

function asList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return [value.trim()];
  }

  return [];
}

function asString(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();

  return trimmed || undefined;
}

function isKind(value: string): value is ShopKind {
  return KIND_VALUES.some((kind) => kind === value);
}

function isSort(value: string): value is ShopSort {
  return SHOP_SORTS.some((sort) => sort === value);
}

function isSizeToken(value: string): boolean {
  return value === CUT_TO_FIT || /^\d+$/.test(value);
}

export function shopSortQuery(sort: ShopSort): ShopSortQuery {
  return SHOP_SORT_QUERY[sort];
}

export function parseShopFilters(searchParams: SearchParams): ShopFilters {
  const kindValue = asString(searchParams.kind);
  const kind = kindValue && isKind(kindValue) ? kindValue : undefined;
  const systemValue = asString(searchParams.system);
  const system: PouchSystem | undefined =
    kind === 'pouches' && (systemValue === 'one' || systemValue === 'two')
      ? systemValue
      : undefined;
  const sortValue = asString(searchParams.sort);
  const sort = sortValue && isSort(sortValue) ? sortValue : 'featured';
  const limitValue = Number(asString(searchParams.limit));
  const limit = FACETED_PAGE_SIZES.find((size) => size === limitValue) ?? DEFAULT_FACETED_PAGE_SIZE;
  const pageValue = Number(asString(searchParams.page));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const term = asString(searchParams.term)?.slice(0, 80);

  return {
    ...(kind ? { kind } : {}),
    ...(system ? { system } : {}),
    brands: asList(searchParams.brand),
    sizes: asList(searchParams.size).filter(isSizeToken),
    ...(term ? { term } : {}),
    sort,
    limit,
    page,
  };
}

export function shopHref(
  path: string,
  filters: ShopFilters,
  patch: Partial<ShopFilters> = {},
): string {
  const next: ShopFilters = {
    ...filters,
    ...patch,
    brands: patch.brands ?? filters.brands,
    sizes: patch.sizes ?? filters.sizes,
  };

  if (next.kind !== 'pouches') {
    next.system = undefined;
  }

  const params = new URLSearchParams();

  if (next.kind) {
    params.set('kind', next.kind);
  }

  if (next.kind === 'pouches' && next.system) {
    params.set('system', next.system);
  }

  next.brands.forEach((brand) => {
    params.append('brand', brand);
  });

  next.sizes.forEach((size) => {
    params.append('size', size);
  });

  if (next.term) {
    params.set('term', next.term);
  }

  if (next.sort !== 'featured') {
    params.set('sort', next.sort);
  }

  if (next.limit !== DEFAULT_FACETED_PAGE_SIZE) {
    params.set('limit', String(next.limit));
  }

  if (next.page > 1) {
    params.set('page', String(next.page));
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export function filtersAreActive(filters: ShopFilters): boolean {
  return Boolean(
    filters.kind ||
      filters.system ||
      filters.brands.length > 0 ||
      filters.sizes.length > 0 ||
      filters.term,
  );
}

export function toggleValue(values: readonly string[], value: string): string[] {
  const key = value.toLowerCase();
  const without = values.filter((item) => item.toLowerCase() !== key);

  if (without.length !== values.length) {
    return without;
  }

  return [...values, value];
}
