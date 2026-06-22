import type { SectionShippingOption } from './section-shipping-storage';

const DEFAULT_SUBSCRIPTION_ONLY_SHIPPING_NAME = 'Subscription free shipping';

/** BigCommerce shipping method display name(s) reserved for subscription quotes and renewal orders. */
export function getSubscriptionOnlyShippingNames(): string[] {
  const configured = process.env.BIGCOMMERCE_SUBSCRIPTION_SHIPPING_METHOD_NAME?.trim();

  const raw = configured || DEFAULT_SUBSCRIPTION_ONLY_SHIPPING_NAME;

  return raw
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

export function isSubscriptionOnlyShippingOption(description: string): boolean {
  const normalized = description.trim().toLowerCase();

  return getSubscriptionOnlyShippingNames().some((name) => normalized === name);
}

/** Options customers may see or select in cart and checkout. */
export function filterCustomerVisibleShippingOptions<T extends { description: string }>(
  options: T[],
): T[] {
  return options.filter((option) => !isSubscriptionOnlyShippingOption(option.description));
}

export function pickSubscriptionShippingOption<
  T extends { description: string; entityId: string; isRecommended?: boolean | null },
>(options: T[]): T | undefined {
  const subscriptionOption = options.find((option) =>
    isSubscriptionOnlyShippingOption(option.description),
  );

  if (subscriptionOption) {
    return subscriptionOption;
  }

  return options.find((option) => option.isRecommended) ?? options[0];
}

export function pickCustomerDefaultShippingOption(
  options: SectionShippingOption[],
  existingOptionId?: string,
): SectionShippingOption | undefined {
  const visibleOptions = filterCustomerVisibleShippingOptions(options);

  if (visibleOptions.length === 0) {
    return undefined;
  }

  if (existingOptionId) {
    const existing = visibleOptions.find((option) => option.entityId === existingOptionId);

    if (existing) {
      return existing;
    }
  }

  return (
    visibleOptions.find((option) => option.cost === 0) ??
    visibleOptions.find((option) => option.isRecommended) ??
    visibleOptions[0]
  );
}
