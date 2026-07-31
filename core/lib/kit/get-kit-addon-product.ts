'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';

import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getSessionCustomerAccessToken } from '~/auth';
import {
  getKitComponentConfiguredPrices,
  getKitComponentProducts,
} from '~/app/[locale]/(default)/product/[slug]/page-data';
import type { CuratedKitProduct } from '~/components/curated-kit-customizer';
import { getPreferredCurrencyCode } from '~/lib/currency';

export type GetKitAddOnProductResult =
  | { status: 'success'; product: CuratedKitProduct }
  | { status: 'error'; message: string };

export async function getKitAddOnProduct(
  productEntityId: number,
): Promise<GetKitAddOnProductResult> {
  if (!Number.isFinite(productEntityId) || productEntityId <= 0) {
    return { status: 'error', message: 'Invalid product' };
  }

  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const format = await getFormatter();
    const components = await getKitComponentProducts({
      entityIds: [productEntityId],
      currencyCode,
      customerAccessToken,
    });

    const component = components[0];

    if (!component) {
      return { status: 'error', message: 'Product not found' };
    }

    const options = removeEdgesAndNodes(component.productOptions).flatMap((option) => {
      if (option.__typename !== 'MultipleChoiceOption') {
        return [];
      }

      const values = removeEdgesAndNodes(option.values).map((value) => ({
        entityId: value.entityId,
        label: value.label,
        isDefault: value.isDefault,
      }));

      if (values.length === 0) {
        return [];
      }

      return [
        {
          entityId: option.entityId,
          displayName: option.displayName,
          isRequired: option.isRequired,
          values,
        },
      ];
    });

    const fallbackMultipleChoices = options.flatMap((option) => {
      const preferred = option.values.find((value) => value.isDefault) ?? option.values[0];

      if (!preferred) {
        return [];
      }

      return [
        {
          optionEntityId: option.entityId,
          optionValueEntityId: preferred.entityId,
        },
      ];
    });

    const selectedOptions =
      fallbackMultipleChoices.length > 0
        ? { multipleChoices: fallbackMultipleChoices }
        : undefined;

    const optionValueIds = selectedOptions?.multipleChoices.map((choice) => ({
      optionEntityId: choice.optionEntityId,
      valueEntityId: choice.optionValueEntityId,
    }));

    const configuredPrices = await getKitComponentConfiguredPrices({
      entityId: productEntityId,
      optionValueIds,
      currencyCode,
      customerAccessToken,
    });

    const prices = configuredPrices ?? component.prices;
    const unitPrice = prices?.salePrice?.value ?? prices?.price.value ?? 0;
    const componentCurrency = prices?.price.currencyCode ?? 'USD';

    const displayPrices =
      prices && prices.priceRange.min.value !== prices.priceRange.max.value
        ? {
            ...prices,
            priceRange: {
              min: prices.price,
              max: prices.price,
            },
          }
        : prices;

    return {
      status: 'success',
      product: {
        productEntityId: component.entityId,
        title: component.name,
        href: component.path,
        image: component.defaultImage
          ? { src: component.defaultImage.url, alt: component.defaultImage.altText }
          : undefined,
        price: pricesTransformer(displayPrices, format),
        unitPrice,
        currencyCode: componentCurrency,
        sku: component.sku,
        defaultQuantity: 1,
        options,
        ...(selectedOptions ? { selectedOptions } : {}),
      },
    };
  } catch {
    return { status: 'error', message: 'Failed to load product' };
  }
}
