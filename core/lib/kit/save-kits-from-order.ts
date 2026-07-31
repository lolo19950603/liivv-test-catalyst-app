import 'server-only';

import type { KitRecord } from '~/lib/kit/types';
import { formatYourCustomKitName } from '~/lib/kit/custom-kit-name';
import { kitCompositionFingerprint } from '~/lib/kit/kit-fingerprint';
import { upsertSavedKit } from '~/lib/supabase/saved-kits-store';

export async function saveKitsFromOrder(input: {
  bigcommerceCustomerId: number;
  kits: KitRecord[];
}): Promise<void> {
  const customerId = String(input.bigcommerceCustomerId);

  if (!customerId || input.kits.length === 0) {
    return;
  }

  for (const kit of input.kits) {
    if (kit.items.length === 0) {
      continue;
    }

    const sourceKitName = kit.name?.trim() || undefined;
    const name = formatYourCustomKitName(sourceKitName ?? 'Kit');
    const fingerprint = kitCompositionFingerprint({
      name: sourceKitName ?? name,
      items: kit.items,
    });

    await upsertSavedKit({
      bigcommerceCustomerId: customerId,
      name,
      sourceKitName,
      fingerprint,
      items: kit.items,
    });
  }
}
