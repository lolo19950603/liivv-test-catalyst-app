import { NextResponse } from 'next/server';

import { normalizeDrugProductPayload, parseDpdJsonBody } from '~/lib/pharmacy/dpd-api';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim().toUpperCase();

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const likePattern = `%${q}%`;
    const searchUrl = `https://health-products.canada.ca/api/drug/drugproduct/?lang=en&type=json&brandname=${encodeURIComponent(likePattern)}`;
    const response = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (compatible; LiivPharmacy/1.0; +https://www.health-products.canada.ca/api/)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const rawText = await response.text();
      const data = parseDpdJsonBody(rawText);
      const products = normalizeDrugProductPayload(data);

      if (products.length > 0) {
        const results = products
          .slice(0, 20)
          .map((p) => {
            const raw = p.drug_code;
            const drugCode = typeof raw === 'number' ? raw : Number(raw);

            return {
              drugCode,
              din: String(p.drug_identification_number ?? ''),
              brandName: String(p.brand_name ?? ''),
              companyName: String(p.company_name ?? ''),
              descriptor: String(p.descriptor ?? ''),
              classType: String(p.class_name ?? 'Human'),
              status: p.status,
            };
          })
          .filter((r) => Number.isFinite(r.drugCode) && r.drugCode > 0);

        return NextResponse.json(results);
      }
    }
  } catch {
    return NextResponse.json({ error: 'dpd_unavailable' }, { status: 503 });
  }

  return NextResponse.json([]);
}
