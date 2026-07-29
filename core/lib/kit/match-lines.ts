import type { KitRecord } from './types';

/**
 * Best-effort: stamp cart lines with a kitId when product + remaining qty
 * match kit composition captured at add-to-cart time.
 */
export function assignKitIdsToCartLines<T extends { productEntityId: number; quantity: number }>(
  lines: T[],
  kits: KitRecord[],
): Array<T & { kitId?: string }> {
  const remaining = lines.map((line) => line.quantity);
  const kitIds: Array<string | undefined> = lines.map(() => undefined);

  for (const kit of kits) {
    for (const item of kit.items) {
      let need = item.quantity;

      for (let i = 0; i < lines.length && need > 0; i += 1) {
        const line = lines[i];

        if (!line || line.productEntityId !== item.productEntityId) {
          continue;
        }

        if ((remaining[i] ?? 0) <= 0) {
          continue;
        }

        if (kitIds[i] && kitIds[i] !== kit.kitId) {
          continue;
        }

        const take = Math.min(remaining[i] ?? 0, need);

        remaining[i] = (remaining[i] ?? 0) - take;
        need -= take;
        kitIds[i] = kit.kitId;
      }
    }
  }

  return lines.map((line, index) => {
    const kitId = kitIds[index];

    return kitId ? { ...line, kitId } : { ...line };
  });
}

export function formatKitPackingStaffNotes(kits: KitRecord[]): string {
  if (kits.length === 0) {
    return '';
  }

  return kits
    .map((kit) => {
      const lines = kit.items.map((item) => {
        const skuPart = item.sku ? ` (${item.sku})` : '';

        return `- ${item.name}${skuPart} × ${item.quantity}`;
      });

      return [
        `KIT PACKING — ${kit.kitId}`,
        'Pack these into the kit box first:',
        ...lines,
        'Then place the kit box with any other items into the shipping box.',
      ].join('\n');
    })
    .join('\n\n');
}
