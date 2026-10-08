/* Twin of ostomy-care/shop-filters.ts @f7f9ef0b — port fixes both ways until Phase 2 */

import type { SearchParams } from 'nuqs/server';

import {
  DEFAULT_FACETED_PAGE_SIZE,
  FACETED_PAGE_SIZES,
} from '@/vibes/soul/sections/products-list-section/constants';

import { SHOP_SORTS, type ShopSort } from '../ostomy-care/shop-filters';

import { NEEDLE_TYPES, SHOP_TYPES, type ShopType } from './shop-classify';

/*
 * The Diabetes Essentials shop's address bar. Every filter is a URL
 * parameter, so a filtered shelf can be linked to (the landing's brand pills
 * open `?brand=<slug>`):
 *
 *   type     one product type (./shop-classify.ts SHOP_TYPES)
 *   brand    repeatable; a brand slug (`dexcom`), or its name in any case
 *   works    repeatable; a device family id (`dexcom-g7`)
 *   length   repeatable, millimetres; only with type pen-needles or syringes
 *   gauge    repeatable; only with type pen-needles or syringes
 *   stock    `1` for in stock only
 *   term, sort, limit, page   as on Ostomy's shop
 */

export interface DiabetesShopFilters {
  type?: ShopType;
  brands: string[];
  works: string[];
  lengths: string[];
  gauges: string[];
  inStock: boolean;
  term?: string;
  sort: ShopSort;
  limit: number;
  page: number;
}

function asList(value: string | string[] | undefined): string[] {
  let values: string[] = [];

  if (Array.isArray(value)) values = value;
  else if (value != null) values = [value];

  return [...new Set(values.map((item) => item.trim().slice(0, 60)).filter(Boolean))];
}

function asString(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();

  return trimmed || undefined;
}

function isType(value: string): value is ShopType {
  return SHOP_TYPES.some((type) => type === value);
}

function isSort(value: string): value is ShopSort {
  return SHOP_SORTS.some((sort) => sort === value);
}

function takesNeedle(type?: ShopType) {
  return type != null && NEEDLE_TYPES.includes(type);
}

export function parseDiabetesShopFilters(searchParams: SearchParams): DiabetesShopFilters {
  const typeValue = asString(searchParams.type);
  const type = typeValue && isType(typeValue) ? typeValue : undefined;
  const sortValue = asString(searchParams.sort);
  const sort = sortValue && isSort(sortValue) ? sortValue : 'featured';
  const limitValue = Number(asString(searchParams.limit));
  const limit = FACETED_PAGE_SIZES.find((size) => size === limitValue) ?? DEFAULT_FACETED_PAGE_SIZE;
  const pageValue = Number(asString(searchParams.page));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const term = asString(searchParams.term)?.slice(0, 80);
  const needle = takesNeedle(type);

  return {
    ...(type ? { type } : {}),
    brands: asList(searchParams.brand),
    works: asList(searchParams.works).map((id) => id.toLowerCase()),
    lengths: needle ? asList(searchParams.length).filter((v) => /^\d+(\.\d+)?$/.test(v)) : [],
    gauges: needle ? asList(searchParams.gauge).filter((v) => /^\d{2}$/.test(v)) : [],
    inStock: asString(searchParams.stock) === '1',
    ...(term ? { term } : {}),
    sort,
    limit,
    page,
  };
}

export function diabetesShopHref(
  path: string,
  filters: DiabetesShopFilters,
  patch: Partial<DiabetesShopFilters> = {},
): string {
  const next: DiabetesShopFilters = { ...filters, ...patch };
  const params = new URLSearchParams();

  if (next.type) params.set('type', next.type);

  next.brands.forEach((brand) => params.append('brand', brand));
  next.works.forEach((id) => params.append('works', id));

  if (takesNeedle(next.type)) {
    next.lengths.forEach((length) => params.append('length', length));
    next.gauges.forEach((gauge) => params.append('gauge', gauge));
  }

  if (next.inStock) params.set('stock', '1');

  if (next.term) params.set('term', next.term);

  if (next.sort !== 'featured') params.set('sort', next.sort);

  if (next.limit !== DEFAULT_FACETED_PAGE_SIZE) params.set('limit', String(next.limit));

  if (next.page > 1) params.set('page', String(next.page));

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export function diabetesFiltersAreActive(filters: DiabetesShopFilters): boolean {
  return Boolean(
    filters.type ||
      filters.brands.length > 0 ||
      filters.works.length > 0 ||
      filters.lengths.length > 0 ||
      filters.gauges.length > 0 ||
      filters.inStock ||
      filters.term,
  );
}

export { toggleValue } from '../ostomy-care/shop-filters';
