import 'server-only';

import { type RxMaskKind, rxMasksOfLines } from '~/lib/catalog/cpap-masks';
import { rxMaskProducts } from '~/lib/catalog/view-only';
import {
  cpapToday,
  pickValidCpapPrescription,
  rxMaskOrderRegion,
} from '~/lib/pharmacy/cpap-prescription';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { listCpapPrescriptionsForCustomer } from '~/lib/supabase/cpap-prescriptions';
import { recordRxOrderCheck, type RxOrderCheckLine } from '~/lib/supabase/rx-order-checks';

import type { CheckoutRxCheck, CheckoutSnapshot } from './types';

/*
 * =============================================================================
 * RECORDING A PAID COMPLETE-MASK ORDER FOR THE PHARMACIST'S SIGN-OFF
 * =============================================================================
 * Owner ruling C26 (b), 2026-10-13: a Liivv pharmacist signs off every order
 * holding a complete CPAP mask, even with a prescription on file. Phase 1
 * records each paid one as a row in public.rx_order_checks, which the "Mask
 * orders" queue in /pharmacy-admin shows. The BigCommerce order itself
 * carries the neutral staff note "RX-CHECK: pharmacist sign-off required
 * before shipping" (~/lib/bigcommerce/cart-order.ts,
 * ~/lib/bigcommerce/subscription-order.ts), so fulfilment sees the hold even
 * if this row could not be written.
 *
 * Two kinds of order are recorded:
 *   checkout   every path that finishes a checkout payment, once the order id
 *              is known (the Stripe webhook and the checkout return page
 *              race; the row is unique on the order id, so the second call
 *              changes nothing). A snapshot built before the gate existed has
 *              no `rxCheck`; its lines are judged here by the register and the
 *              name rule instead.
 *   renewal    a Subscribe & save order made by Stripe billing, with no
 *              checkout gate before it: complete masks were offered on
 *              Subscribe & save before 2026-10-13, and those subscriptions
 *              still renew. The row records the prescription valid that day,
 *              or none.
 *
 * The prescription and profile are read from Supabase here, not carried in
 * the checkout snapshot (which is stored in KV).
 *
 * Best effort: a failure (Supabase not configured, the migration not run, a
 * network error) is logged as an error and never fails the paid order.
 * =============================================================================
 */

const UNRECORDED =
  'holds a complete CPAP mask but could not be recorded for pharmacist sign-off. Its BigCommerce staff note says RX-CHECK; add it to the Mask orders queue by hand.';

/*
 * Which of an order's products are complete masks, for an order made without
 * the checkout gate's answer (a renewal). The catalogue is asked first; if it
 * can't answer, the register and the name rule on each line's name still do
 * (every registered mask is found), and the failure is logged.
 */
export async function rxMasksInOrderLines(
  lines: ReadonlyArray<{ productEntityId?: number | null; name: string }>,
): Promise<Map<number, RxMaskKind>> {
  const ids = lines.flatMap((line) => (line.productEntityId ? [line.productEntityId] : []));
  let fromCatalogue = new Map<number, RxMaskKind>();

  try {
    fromCatalogue = await rxMaskProducts(ids, { throwOnLookupFailure: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[rx-order-checks] The catalogue could not say which of products ${ids.join(', ')} are complete CPAP masks; the register and the name rule were used.`,
      error,
    );
  }

  return rxMasksOfLines(lines, fromCatalogue);
}

/*
 * Records one paid complete-mask order for sign-off, against the customer's
 * Supabase profile and the CPAP prescription valid today (or none). Never
 * throws.
 */
export async function recordRxMaskOrderForCustomer({
  bigcommerceCustomerId,
  bigcommerceOrderId,
  masks,
  lines,
  region,
  source,
}: {
  bigcommerceCustomerId: number;
  bigcommerceOrderId: number;
  masks: ReadonlyMap<number, RxMaskKind>;
  lines: RxOrderCheckLine[];
  region: string | null;
  /** For the log: where the order came from. */
  source: string;
}): Promise<void> {
  if (masks.size === 0) {
    return;
  }

  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const onFile = await listCpapPrescriptionsForCustomer(bigcommerceCustomerId);

    if (!onFile.profileId) {
      throw new Error(`BigCommerce customer ${bigcommerceCustomerId} has no Supabase profile`);
    }

    const valid = pickValidCpapPrescription(onFile.rows, cpapToday());
    const result = await recordRxOrderCheck({
      profileId: onFile.profileId,
      bigcommerceOrderId,
      prescriptionId: valid?.id ?? null,
      productIds: [...masks.keys()],
      lines,
      paediatric: [...masks.values()].includes('paediatric'),
      region,
    });

    if (!result.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[rx-order-checks] BigCommerce order ${bigcommerceOrderId} (${source}) ${UNRECORDED}`,
      error,
    );
  }
}

/*
 * What a checkout order holds for the sign-off: the snapshot's own answer
 * when the gate gave one, or, for a snapshot built before the gate existed,
 * the complete masks the register and the name rule find in its lines. Null
 * when it holds none. Pure and synchronous, so the order's staff note
 * (~/lib/bigcommerce/cart-order.ts) and the recording agree.
 */
export function rxCheckOfCheckoutSnapshot(
  snapshot: Pick<CheckoutSnapshot, 'rxCheck' | 'lineItems' | 'shippingAddress'>,
): (CheckoutRxCheck & { masks: Map<number, RxMaskKind> }) | null {
  if (snapshot.rxCheck) {
    const kind: RxMaskKind = snapshot.rxCheck.paediatric ? 'paediatric' : 'adult';

    return {
      ...snapshot.rxCheck,
      masks: new Map(snapshot.rxCheck.productIds.map((id) => [id, kind])),
    };
  }

  const masks = rxMasksOfLines(snapshot.lineItems);

  if (masks.size === 0) {
    return null;
  }

  const { region, alwaysHold } = rxMaskOrderRegion(
    snapshot.shippingAddress?.stateOrProvince,
    snapshot.shippingAddress?.postalCode,
  );

  return {
    productIds: [...masks.keys()],
    paediatric: [...masks.values()].includes('paediatric'),
    region,
    alwaysHold,
    lines: snapshot.lineItems
      .filter((line) => masks.has(line.productEntityId))
      .map((line) => ({
        productId: line.productEntityId,
        name: line.name,
        quantity: line.quantity,
        ...(line.variantSubtitle ? { options: line.variantSubtitle } : {}),
      })),
    masks,
  };
}

/* Records a paid checkout order for sign-off when it holds a complete mask. Never throws. */
export async function recordRxMaskOrderForSignoff(
  snapshot: Pick<
    CheckoutSnapshot,
    'rxCheck' | 'id' | 'lineItems' | 'shippingAddress' | 'bigcommerceCustomerId'
  >,
  bigcommerceOrderId: number,
): Promise<void> {
  const check = rxCheckOfCheckoutSnapshot(snapshot);

  if (!check) {
    return;
  }

  await recordRxMaskOrderForCustomer({
    bigcommerceCustomerId: snapshot.bigcommerceCustomerId,
    bigcommerceOrderId,
    masks: check.masks,
    lines: check.lines,
    region: check.region,
    source: `checkout snapshot ${snapshot.id}`,
  });
}
