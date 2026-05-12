import { NextResponse } from 'next/server';

import { isDiabetesCareSectionSuffix } from '~/lib/archived-pages/diabetes-care-section-allowlist';
import { getDiabetesCareShopifySectionHtml } from '~/lib/archived-pages/diabetes-care-section-html';

interface Params {
  params: Promise<{ section: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { section } = await params;

  if (!isDiabetesCareSectionSuffix(section)) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  }

  try {
    const html = await getDiabetesCareShopifySectionHtml(section);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load section';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
