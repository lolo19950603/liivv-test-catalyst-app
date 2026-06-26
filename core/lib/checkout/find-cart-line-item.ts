import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

import { mapCartSelectedOptionsToProductOptions } from './map-cart-options';
import { productOptionsCover, productOptionsKey } from './product-options-key';

interface CartLineItemLike {
  entityId: string;
  productEntityId: number;
  selectedOptions: Parameters<typeof mapCartSelectedOptionsToProductOptions>[0];
}

export function findMatchingCartLineItems(
  items: CartLineItemLike[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): CartLineItemLike[] {
  const targetKey = productOptionsKey(productOptions);
  const productLines = items.filter((item) => item.productEntityId === productEntityId);

  if (productLines.length === 0) {
    return [];
  }

  const exactMatches = productLines.filter((item) => {
    const cartOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);

    return productOptionsKey(cartOptions) === targetKey;
  });

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const compatibleMatches = productLines.filter((item) => {
    const cartOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);

    return (
      productOptionsCover(productOptions, cartOptions) ||
      productOptionsCover(cartOptions, productOptions)
    );
  });

  if (compatibleMatches.length > 0) {
    return compatibleMatches;
  }

  return productLines;
}

export function findMatchingCartLineItem(
  items: CartLineItemLike[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): CartLineItemLike | undefined {
  const matches = findMatchingCartLineItems(items, productEntityId, productOptions);

  if (matches.length === 0) {
    return undefined;
  }

  if (matches.length === 1) {
    return matches[0];
  }

  return matches.at(-1);
}
