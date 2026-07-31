import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

export const KIT_VARIANTS_FIELD = 'kit_variants';

export type KitVariantOverrideMap = Record<string, string | number>;

/**
 * Custom field `kit_variants` on a curated kit product.
 * Maps component product entity IDs to a variant SKU or variant entity ID.
 *
 * Example:
 * {"7828":"WC-211157","7971":10122}
 */
export function parseKitVariantOverrides(
  customFields: Array<{ name: string; value: string }> | null | undefined,
): KitVariantOverrideMap {
  if (!customFields?.length) {
    return {};
  }

  const field = customFields.find(
    (entry) => entry.name.trim().toLowerCase() === KIT_VARIANTS_FIELD,
  );

  if (!field?.value?.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(field.value);

    if (typeof parsed !== 'object' || parsed == null || Array.isArray(parsed)) {
      return {};
    }

    const map: KitVariantOverrideMap = {};

    for (const [productId, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) {
        map[productId] = value.trim();
        continue;
      }

      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        map[productId] = value;
      }
    }

    return map;
  } catch {
    return {};
  }
}

export function parseKitVariantOverridesFromConnection(product: {
  customFields?: {
    edges?: Array<{ node: { name: string; value: string } } | null> | null;
  } | null;
}): KitVariantOverrideMap {
  const fields = product.customFields ? removeEdgesAndNodes(product.customFields) : [];

  return parseKitVariantOverrides(fields);
}

export function getKitVariantOverride(
  overrides: KitVariantOverrideMap,
  productEntityId: number,
): string | number | undefined {
  return overrides[String(productEntityId)];
}
