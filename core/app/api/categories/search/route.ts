import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getFlatStoreCategories } from '~/client/queries/get-flat-store-categories';
import { routing } from '~/i18n/routing';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') ?? routing.defaultLocale;
  const query = (searchParams.get('q') ?? '').trim();

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  try {
    const categories = await getFlatStoreCategories(locale);
    const normalizedQuery = query.toLowerCase();

    const filtered =
      normalizedQuery.length === 0
        ? categories
        : categories.filter(
            (category) =>
              category.name.toLowerCase().includes(normalizedQuery) ||
              category.breadcrumb.toLowerCase().includes(normalizedQuery),
          );

    return NextResponse.json({
      status: 'success',
      options: filtered.slice(0, 50).map((category) => ({
        id: category.entityId.toString(),
        label: category.breadcrumb,
        value: category.entityId.toString(),
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[categories/search] Failed to load categories:', error);

    return NextResponse.json(
      { status: 'error', error: 'Failed to load categories' },
      { status: 500 },
    );
  }
};
