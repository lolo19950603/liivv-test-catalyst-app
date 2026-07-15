import 'server-only';

export interface ProductOptionSelection {
  optionEntityId: number;
  valueEntityId: number;
}

export function parseProductOptionSelectionsFromFormData(
  formData: FormData,
): ProductOptionSelection[] {
  return [...formData.entries()]
    .filter(([key]) => /^\d+$/.test(key))
    .map(([optionEntityId, value]) => ({
      optionEntityId: Number(optionEntityId),
      valueEntityId: Number(value),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}

export const BIGCOMMERCE_PRODUCT_OPTIONS_METADATA_KEY = 'bigcommerce_product_options';
export const BIGCOMMERCE_VARIANT_ID_METADATA_KEY = 'bigcommerce_variant_id';
export const BIGCOMMERCE_VARIANT_LABEL_METADATA_KEY = 'bigcommerce_variant_label';

export function parseVariantEntityIdFromMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
): number | undefined {
  const value = Number(metadata?.[BIGCOMMERCE_VARIANT_ID_METADATA_KEY]);

  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function parseVariantLabelFromMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
): string | undefined {
  const label = metadata?.[BIGCOMMERCE_VARIANT_LABEL_METADATA_KEY]?.trim();

  if (!label) {
    return undefined;
  }

  // Catalog option is named "Quantity" in BigCommerce but represents UOM (e.g. Box of 24).
  return label.replace(/(^| · )Quantity:/gi, '$1UOM:');
}

export function serializeProductOptionSelections(
  options: ProductOptionSelection[],
): string | undefined {
  if (options.length === 0) {
    return undefined;
  }

  return JSON.stringify(options);
}

export function parseProductOptionSelectionsFromMetadata(
  raw: string | undefined | null,
): ProductOptionSelection[] {
  if (!raw?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => {
        if (typeof entry !== 'object' || entry == null) {
          return null;
        }

        const optionEntityId = Number(
          'optionEntityId' in entry ? entry.optionEntityId : undefined,
        );
        const valueEntityId = Number('valueEntityId' in entry ? entry.valueEntityId : undefined);

        if (Number.isNaN(optionEntityId) || Number.isNaN(valueEntityId)) {
          return null;
        }

        return { optionEntityId, valueEntityId };
      })
      .filter((option): option is ProductOptionSelection => option !== null);
  } catch {
    return [];
  }
}

export function toBigCommerceOrderProductOptions(
  options: ProductOptionSelection[],
): Array<{ id: number; value: string }> {
  return options.map((option) => ({
    id: option.optionEntityId,
    value: String(option.valueEntityId),
  }));
}
