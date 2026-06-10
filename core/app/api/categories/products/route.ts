import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { z } from 'zod';

import { getCategoryProducts } from '~/client/queries/get-category-products';
import { routing } from '~/i18n/routing';

const QuerySchema = z.object({
  ids: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(48).optional(),
  sort: z
    .enum([
      'A_TO_Z',
      'BEST_REVIEWED',
      'BEST_SELLING',
      'FEATURED',
      'HIGHEST_PRICE',
      'LOWEST_PRICE',
      'NEWEST',
      'RELEVANCE',
      'Z_TO_A',
    ])
    .optional(),
  searchSubCategories: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value !== 'false'),
});

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') ?? routing.defaultLocale;

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  const parsed = QuerySchema.safeParse({
    ids: searchParams.get('ids') ?? '',
    limit: searchParams.get('limit') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    searchSubCategories: searchParams.get('searchSubCategories') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid query parameters' },
      { status: 400 },
    );
  }

  const categoryEntityIds = parsed.data.ids
    .split(',')
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (categoryEntityIds.length === 0) {
    return NextResponse.json({ status: 'success', products: [], totalItems: 0 });
  }

  const result = await getCategoryProducts({
    categoryEntityIds,
    limit: parsed.data.limit ?? 12,
    sort: parsed.data.sort ?? 'FEATURED',
    searchSubCategories: parsed.data.searchSubCategories ?? true,
    locale,
  });

  return NextResponse.json(result);
};
