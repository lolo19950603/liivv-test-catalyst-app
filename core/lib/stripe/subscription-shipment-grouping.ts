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
