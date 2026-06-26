import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import {
  parseProductOptionSelectionsFromMetadata,
  parseVariantEntityIdFromMetadata,
  parseVariantLabelFromMetadata,
  type ProductOptionSelection,
} from '~/lib/bigcommerce/product-options';

import type { CustomerSubscription } from './subscriptions';

export interface SubscriptionProductImage {
  src: string;
  alt: string;
}

export interface SubscriptionVariantDisplay {
  variantSubtitle?: string;
  image?: SubscriptionProductImage;
}

const SubscriptionVariantCatalogQuery = graphql(`
  query SubscriptionVariantCatalogQuery($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        entityId
        sku
        defaultImage {
          altText
          url: urlTemplate(lossy: true)
        }
        variants(first: 50) {
          edges {
            node {
              entityId
              sku
              defaultImage {
                altText
                url: urlTemplate(lossy: true)
              }
            }
          }
        }
        productOptions(first: 50) {
          edges {
            node {
              entityId
              displayName
              ... on MultipleChoiceOption {
                values(first: 50) {
                  edges {
                    node {
                      entityId
                      label
                    }
                  }
                }
              }
              ... on CheckboxOption {
                label
                checkedOptionValueEntityId
                uncheckedOptionValueEntityId
              }
            }
          }
        }
      }
    }
  }
`);

interface ProductOptionCatalogNode {
  entityId: number;
  displayName: string;
  label?: string;
  checkedOptionValueEntityId?: number;
  uncheckedOptionValueEntityId?: number;
  values?: {
    edges: Array<{ node: { entityId: number; label: string } }> | null;
  } | null;
}

function formatSkuSubtitle(sku: string | undefined): string | undefined {
  const trimmed = sku?.trim();

  return trimmed ? `SKU: ${trimmed}` : undefined;
}

function formatOptionSelectionsLabel(
  selections: ProductOptionSelection[],
  optionNodes: ProductOptionCatalogNode[],
): string | undefined {
  const parts = selections
    .map((selection) => {
      const option = optionNodes.find((node) => node.entityId === selection.optionEntityId);

      if (!option) {
        return undefined;
      }

      const multipleChoiceValues = removeEdgesAndNodes(option.values);

      if (multipleChoiceValues.length > 0) {
        const value = multipleChoiceValues.find(
          (entry) => entry.entityId === selection.valueEntityId,
        );

        return value ? `${option.displayName}: ${value.label}` : undefined;
      }

      if (option.checkedOptionValueEntityId != null) {
        const isChecked = selection.valueEntityId === option.checkedOptionValueEntityId;

        return `${option.displayName}: ${isChecked ? option.label ?? 'Yes' : 'No'}`;
      }

      return undefined;
    })
    .filter((part): part is string => Boolean(part?.trim()));

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

function buildVariantSubtitle({
  storedLabel,
  selections,
  optionNodes,
  sku,
}: {
  storedLabel?: string;
  selections: ProductOptionSelection[];
  optionNodes: ProductOptionCatalogNode[];
  sku?: string;
}): string | undefined {
  if (storedLabel) {
    return storedLabel;
  }

  const optionLabel = formatOptionSelectionsLabel(selections, optionNodes);

  if (optionLabel) {
    return optionLabel;
  }

  return formatSkuSubtitle(sku);
}

function resolveVariantImage(
  product: {
    defaultImage?: { altText?: string | null; url?: string | null } | null;
    variants?: {
      edges: Array<{
        node: {
          entityId: number;
          sku: string;
          defaultImage?: { altText?: string | null; url?: string | null } | null;
        };
      }> | null;
    } | null;
  },
  variantEntityId?: number,
  productName?: string,
): SubscriptionProductImage | undefined {
  const variants = removeEdgesAndNodes(product.variants);
  const variant =
    variantEntityId != null
      ? variants.find((entry) => entry.entityId === variantEntityId)
      : undefined;
  const imageSource = variant?.defaultImage?.url?.trim()
    ? variant.defaultImage
    : product.defaultImage?.url?.trim()
      ? product.defaultImage
      : undefined;

  if (!imageSource?.url) {
    return undefined;
  }

  return {
    src: imageSource.url,
    alt: imageSource.altText || productName || variant?.sku || 'Product image',
  };
}

async function loadProductVariantCatalog(productEntityId: number) {
  const { data } = await client.fetch({
    document: SubscriptionVariantCatalogQuery,
    variables: { entityId: productEntityId },
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product;
}

export async function resolveSubscriptionVariantDisplays(
  subscriptions: CustomerSubscription[],
): Promise<Map<string, SubscriptionVariantDisplay>> {
  const displays = new Map<string, SubscriptionVariantDisplay>();
  const productIds = [
    ...new Set(
      subscriptions
        .map((subscription) => subscription.productEntityId)
        .filter((productEntityId): productEntityId is number => productEntityId != null),
    ),
  ];

  const catalogs = new Map<
    number,
    Awaited<ReturnType<typeof loadProductVariantCatalog>>
  >();

  await Promise.all(
    productIds.map(async (productEntityId) => {
      try {
        const product = await loadProductVariantCatalog(productEntityId);

        if (product) {
          catalogs.set(productEntityId, product);
        }
      } catch {
        // Fall back to metadata labels when catalog lookup fails.
      }
    }),
  );

  for (const subscription of subscriptions) {
    const productEntityId = subscription.productEntityId;

    if (productEntityId == null) {
      continue;
    }

    const catalog = catalogs.get(productEntityId);
    const optionNodes = catalog
      ? removeEdgesAndNodes(catalog.productOptions).map((node) => ({
          entityId: node.entityId,
          displayName: node.displayName,
          label: 'label' in node ? node.label : undefined,
          checkedOptionValueEntityId:
            'checkedOptionValueEntityId' in node ? node.checkedOptionValueEntityId : undefined,
          uncheckedOptionValueEntityId:
            'uncheckedOptionValueEntityId' in node
              ? node.uncheckedOptionValueEntityId
              : undefined,
          values: 'values' in node ? node.values : undefined,
        }))
      : [];
    const variantEntityId =
      subscription.variantEntityId ??
      parseVariantEntityIdFromMetadata(subscription.metadata);
    const selections = parseProductOptionSelectionsFromMetadata(
      subscription.metadata.bigcommerce_product_options,
    );
    const storedLabel =
      subscription.variantSubtitle ?? parseVariantLabelFromMetadata(subscription.metadata);
    const sku =
      subscription.metadata.bigcommerce_sku?.trim() ||
      catalog?.sku ||
      catalog?.variants?.edges
        ?.map((edge) => edge.node)
        .find((variant) => variant.entityId === variantEntityId)?.sku;

    const variantSubtitle = buildVariantSubtitle({
      storedLabel,
      selections,
      optionNodes,
      sku,
    });
    const image = catalog
      ? resolveVariantImage(catalog, variantEntityId, subscription.productName)
      : undefined;

    if (variantSubtitle || image) {
      displays.set(subscription.id, {
        ...(variantSubtitle ? { variantSubtitle } : {}),
        ...(image ? { image } : {}),
      });
    }
  }

  return displays;
}
