import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

const KIT_TYPE_FIELD = 'kit_type';
const KIT_TYPE_CURATED = 'curated';

export function isCuratedKitProduct(
  customFields: Array<{ name: string; value: string }> | null | undefined,
): boolean {
  if (!customFields?.length) {
    return false;
  }

  return customFields.some(
    (field) =>
      field.name.trim().toLowerCase() === KIT_TYPE_FIELD &&
      field.value.trim().toLowerCase() === KIT_TYPE_CURATED,
  );
}

export function isCuratedKitFromProductConnection(product: {
  customFields?: {
    edges?: Array<{ node: { name: string; value: string } } | null> | null;
  } | null;
}): boolean {
  const fields = product.customFields ? removeEdgesAndNodes(product.customFields) : [];

  return isCuratedKitProduct(fields);
}

export { KIT_TYPE_CURATED, KIT_TYPE_FIELD };
