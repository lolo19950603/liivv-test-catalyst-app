import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ drugCode: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { drugCode: raw } = await context.params;
  const drugCode = Number.parseInt(raw, 10);

  if (!Number.isFinite(drugCode)) {
    return NextResponse.json({ ingredients: [], forms: [], routes: [] });
  }

  try {
    const [ingredientRes, formRes, routeRes] = await Promise.all([
      fetch(`https://health-products.canada.ca/api/drug/activeingredient/?lang=en&id=${drugCode}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://health-products.canada.ca/api/drug/form/?lang=en&id=${drugCode}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://health-products.canada.ca/api/drug/route/?lang=en&id=${drugCode}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const ingredients = ingredientRes.ok ? await ingredientRes.json() : [];
    const forms = formRes.ok ? await formRes.json() : [];
    const routes = routeRes.ok ? await routeRes.json() : [];

    return NextResponse.json({
      ingredients: Array.isArray(ingredients)
        ? ingredients.map((i) => {
            const rec = i as Record<string, unknown>;

            return {
              name: rec.ingredient_name,
              strength: rec.strength,
              strengthUnit: rec.strength_unit,
              dosageValue: rec.dosage_value,
              dosageUnit: rec.dosage_unit,
            };
          })
        : [],
      forms: Array.isArray(forms)
        ? forms.map((f) => (f as Record<string, unknown>).pharmaceutical_form_name)
        : [],
      routes: Array.isArray(routes)
        ? routes.map((r) => (r as Record<string, unknown>).route_of_administration_name)
        : [],
    });
  } catch {
    return NextResponse.json({ ingredients: [], forms: [], routes: [] });
  }
}
