import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

export function productOptionsKey(options: ProductOptionSelection[]): string {
  return options
    .map((option) => `${option.optionEntityId}:${option.valueEntityId}`)
    .sort()
    .join('|');
}

export function productOptionsCover(
  stored: ProductOptionSelection[],
  cart: ProductOptionSelection[],
): boolean {
  if (stored.length === 0 || cart.length === 0) {
    return false;
  }

  const cartKeys = new Set(cart.map((option) => `${option.optionEntityId}:${option.valueEntityId}`));

  return stored.every((option) =>
    cartKeys.has(`${option.optionEntityId}:${option.valueEntityId}`),
  );
}
