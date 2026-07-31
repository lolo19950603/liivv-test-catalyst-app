import { createHash } from 'crypto';

import type { KitItem, KitRecord } from './types';

function normalizeItem(item: KitItem): string {
  const choices = [...(item.selectedOptions?.multipleChoices ?? [])]
    .map((choice) => `${choice.optionEntityId}:${choice.optionValueEntityId}`)
    .sort()
    .join(',');

  return [
    item.productEntityId,
    item.quantity,
    item.variantEntityId ?? '',
    choices,
  ].join(':');
}

/** Stable fingerprint for idempotent saved-kit upserts after order fulfillment. */
export function kitCompositionFingerprint(kit: Pick<KitRecord, 'name' | 'items'>): string {
  const items = [...kit.items].map(normalizeItem).sort().join('|');
  const source = `${kit.name ?? ''}|${items}`;

  return createHash('sha256').update(source).digest('hex').slice(0, 32);
}
