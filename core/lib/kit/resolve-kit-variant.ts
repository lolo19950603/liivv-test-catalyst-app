import 'server-only';

import { bigCommerceAdminFetch, isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';

import { getKitVariantOverride, type KitVariantOverrideMap } from './kit-variants';

export interface KitSelectedMultipleChoice {
  optionEntityId: number;
  optionValueEntityId: number;
}

export interface KitComponentVariantSelection {
  variantEntityId?: number;
  selectedOptions?: {
    multipleChoices: KitSelectedMultipleChoice[];
  };
}

interface CatalogVariant {
  id: number;
  sku: string;
  option_values?: Array<{
    id: number;
    option_id: number;
    label?: string;
  }>;
}

interface CatalogVariantsResponse {
  data?: CatalogVariant[];
}

function toSelection(variant: CatalogVariant): KitComponentVariantSelection {
  const multipleChoices = (variant.option_values ?? []).map((optionValue) => ({
    optionEntityId: optionValue.option_id,
    optionValueEntityId: optionValue.id,
  }));

  return {
    variantEntityId: variant.id,
    ...(multipleChoices.length > 0 ? { selectedOptions: { multipleChoices } } : {}),
  };
}

/**
 * Resolve a kit-level variant override (SKU or variant entity id) into cart selections.
 * Uses Catalog REST so we can read variant option_values.
 */
export async function resolveKitComponentVariantSelection(
  productEntityId: number,
  overrides: KitVariantOverrideMap,
): Promise<KitComponentVariantSelection | null> {
  const override = getKitVariantOverride(overrides, productEntityId);

  if (override == null || !isBigCommerceAdminConfigured()) {
    return null;
  }

  try {
    const query =
      typeof override === 'number'
        ? `id:in=${override}`
        : `sku:in=${encodeURIComponent(override)}`;

    const response = await bigCommerceAdminFetch<CatalogVariantsResponse>(
      `/v3/catalog/products/${productEntityId}/variants?${query}&limit=10`,
    );

    const variant = response.data?.[0];

    if (!variant) {
      return null;
    }

    return toSelection(variant);
  } catch {
    return null;
  }
}
