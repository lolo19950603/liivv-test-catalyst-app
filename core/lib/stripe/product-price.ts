import 'server-only';

import { getStripe, isStripeConfigured } from './client';
import { getSubscriptionPlans } from './plans';

const STRIPE_PRICE_FIELD_NAMES = new Set([
  'stripe_price_id',
  'stripe price id',
  'stripe_subscription_price_id',
  'stripe subscription price id',
]);

export function getStripePriceIdFromCustomFields(
  customFields: Array<{ name: string; value: string }>,
): string | null {
  const matchingField = customFields.find((field) =>
    STRIPE_PRICE_FIELD_NAMES.has(field.name.trim().toLowerCase()),
  );

  if (!matchingField) {
    return null;
  }

  const value = matchingField.value.trim();

  return value.startsWith('price_') ? value : null;
}

export async function findStripePriceIdBySku(sku: string): Promise<string | null> {
  const normalizedSku = sku.trim();

  if (!normalizedSku || !isStripeConfigured()) {
    return null;
  }

  try {
    const stripe = getStripe();
    const prices = await stripe.prices.list({
      lookup_keys: [normalizedSku],
      active: true,
      limit: 1,
    });

    const price = prices.data[0];

    if (price?.id) {
      return price.id;
    }
  } catch {
    // lookup_keys may be unset — fall through to name matching.
  }

  return null;
}

export async function resolveProductStripePriceId({
  productName,
  sku,
  customFields,
}: {
  productName: string;
  sku: string;
  customFields: Array<{ name: string; value: string }>;
}): Promise<string | null> {
  const fromCustomField = getStripePriceIdFromCustomFields(customFields);

  if (fromCustomField) {
    return fromCustomField;
  }

  const fromSku = await findStripePriceIdBySku(sku);

  if (fromSku) {
    return fromSku;
  }

  if (!isStripeConfigured()) {
    return null;
  }

  const normalizedName = productName.trim().toLowerCase();
  const plans = await getSubscriptionPlans();
  const matchingPlan = plans.find(
    (plan) => plan.productName.trim().toLowerCase() === normalizedName,
  );

  return matchingPlan?.id ?? null;
}
