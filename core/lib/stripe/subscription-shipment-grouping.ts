/** UTC calendar day key (YYYY-MM-DD), aligned with subscription delivery grouping. */
export function getShipmentCalendarDayKey(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export function buildSubscriptionOrderBatchStorageKey({
  customerId,
  dayKey,
  shippingAddressKey,
}: {
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
}): string {
  return `${customerId}:${dayKey}:${shippingAddressKey}`;
}

export function getNextShipmentTimestamp(
  subscription: Pick<
    import('./subscriptions').CustomerSubscription,
    'trialEnd' | 'billingCycleAnchor' | 'currentPeriodEnd'
  >,
): number {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.trialEnd && subscription.trialEnd > now) {
    return subscription.trialEnd;
  }

  if (subscription.billingCycleAnchor && subscription.billingCycleAnchor > now) {
    return subscription.billingCycleAnchor;
  }

  return subscription.currentPeriodEnd;
}
