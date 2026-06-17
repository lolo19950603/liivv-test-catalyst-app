import type { SectionShippingOption } from './section-shipping-storage';

/** Matches BigCommerce free-shipping-over-$200 store rule for per-section eligibility. */
export const FREE_SHIPPING_MIN_SUBTOTAL = 200;

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_MIN_SUBTOTAL;
}

/** Hide $0 shipping options when the section subtotal does not meet the free-shipping threshold. */
export function filterShippingOptionsBySubtotal(
  options: SectionShippingOption[],
  qualifyingSubtotal: number,
): SectionShippingOption[] {
  if (qualifiesForFreeShipping(qualifyingSubtotal)) {
    return options;
  }

  const paidOptions = options.filter((option) => option.cost > 0);

  return paidOptions.length > 0 ? paidOptions : options;
}
