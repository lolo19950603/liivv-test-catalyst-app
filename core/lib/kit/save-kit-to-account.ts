'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { formatYourCustomKitName } from '~/lib/kit/custom-kit-name';
import { kitCompositionFingerprint } from '~/lib/kit/kit-fingerprint';
import { kitItemSchema } from '~/lib/kit/kit-item-schema';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { upsertSavedKit } from '~/lib/supabase/saved-kits-store';

const saveKitSchema = z.object({
  kitName: z.string().min(1),
  items: z.array(kitItemSchema).min(1),
  /** Path to return to after login (pathname + search). */
  returnTo: z.string().optional(),
});

export type SaveKitToAccountInput = z.infer<typeof saveKitSchema>;

export type SaveKitToAccountResult =
  | { status: 'success'; name: string }
  | { status: 'login_required'; redirectTo: string }
  | { status: 'error'; message: string };

const CustomerEntityIdQuery = graphql(`
  query SaveKitCustomerEntityIdQuery {
    customer {
      entityId
    }
  }
`);

type SaveKitMessages = {
  (
    key:
      | 'Errors.emptyKit'
      | 'Errors.unexpected'
      | 'Errors.saveFailed'
      | 'Errors.saveUnavailable'
  ): string;
};

export async function saveKitToAccount(
  input: SaveKitToAccountInput,
): Promise<SaveKitToAccountResult> {
  const t = (await getTranslations('Faceted.CuratedKit')) as unknown as SaveKitMessages;
  const parsed = saveKitSchema.safeParse(input);

  if (!parsed.success) {
    return { status: 'error', message: t('Errors.emptyKit') };
  }

  const customerAccessToken = await getSessionCustomerAccessToken();
  const returnTo = parsed.data.returnTo ?? '/account/wishlists/';

  if (!customerAccessToken) {
    const loginParams = new URLSearchParams({ redirectTo: returnTo });

    return { status: 'login_required', redirectTo: `/login?${loginParams.toString()}` };
  }

  if (!isSupabaseConfigured()) {
    return { status: 'error', message: t('Errors.saveUnavailable') };
  }

  try {
    const { data } = await client.fetch({
      document: CustomerEntityIdQuery,
      customerAccessToken,
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    });

    const entityId = data.customer?.entityId;

    if (!entityId) {
      const loginParams = new URLSearchParams({ redirectTo: returnTo });

      return { status: 'login_required', redirectTo: `/login?${loginParams.toString()}` };
    }

    const sourceKitName = parsed.data.kitName.trim();
    const name = formatYourCustomKitName(sourceKitName);
    const fingerprint = kitCompositionFingerprint({
      name: sourceKitName,
      items: parsed.data.items,
    });

    const saved = await upsertSavedKit({
      bigcommerceCustomerId: String(entityId),
      name,
      sourceKitName,
      fingerprint,
      items: parsed.data.items,
    });

    if (!saved) {
      return { status: 'error', message: t('Errors.saveFailed') };
    }

    return { status: 'success', name: saved.name };
  } catch {
    return { status: 'error', message: t('Errors.unexpected') };
  }
}
