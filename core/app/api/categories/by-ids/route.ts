import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getCategoriesByIds } from '~/client/queries/get-store-category-catalog';
import { routing } from '~/i18n/routing';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') ?? routing.defaultLocale;
  const idsParam = searchParams.get('ids') ?? '';

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  const entityIds = idsParam
    .split(',')
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (entityIds.length === 0) {
    return NextResponse.json({ status: 'success', categories: [] });
  }

  try {
    const categories = await getCategoriesByIds(entityIds, locale);

    return NextResponse.json({ status: 'success', categories });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[categories/by-ids] Failed to load categories:', error);

    return NextResponse.json(
      { status: 'error', error: 'Failed to load categories' },
      { status: 500 },
    );
  }
};
