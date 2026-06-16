import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

import { mapCartSelectedOptionsToProductOptions } from './map-cart-options';
import { productOptionsCover, productOptionsKey } from './product-options-key';

interface CartLineItemLike {
  entityId: string;
  productEntityId: number;
  selectedOptions: Parameters<typeof mapCartSelectedOptionsToProductOptions>[0];
}

export function findMatchingCartLineItem(
  items: CartLineItemLike[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): CartLineItemLike | undefined {
  const targetKey = productOptionsKey(productOptions);
  const productLines = items.filter((item) => item.productEntityId === productEntityId);

  if (productLines.length === 0) {
    return undefined;
  }

  const exactMatch = productLines.find((item) => {
    const cartOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);

    return productOptionsKey(cartOptions) === targetKey;
  });

  if (exactMatch) {
    return exactMatch;
  }

  const compatibleMatch = productLines.find((item) => {
    const cartOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);

    return (
      productOptionsCover(productOptions, cartOptions) ||
      productOptionsCover(cartOptions, productOptions)
    );
  });

  if (compatibleMatch) {
    return compatibleMatch;
  }

  if (productLines.length === 1) {
    return productLines[0];
  }

  return productLines.at(-1);
}
